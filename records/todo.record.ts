import {TodoEntity, TodoEntityDto} from "../types";
import {ValidationError} from "../utils/errors";
import {pool} from "../utils/db";
import {FieldPacket, RowDataPacket} from "mysql2";
import {v4 as uuid} from "uuid";

interface NewTodoEntity extends Omit<TodoEntity, 'id'>{
    id?: string;
}

type TodoRecordResults = [[TodoEntity], [FieldPacket]];

export class TodoRecord implements TodoEntity{
    id: string;
    title: string;
    description: string;
    isClosed: boolean;
    ownerId: string;


    constructor(obj: NewTodoEntity) {

        if(!obj.title){
            throw new ValidationError('Tytył zadania nie może być pusty.')
        }

        if(obj.title.length > 50){
            throw new ValidationError('Tytył zadania nie może przekraczać 50 znaków.')
        }

        if(obj.title.length > 1000){
            throw new ValidationError('Opis zadania nie może przekraczać 1000 znaków.')
        }

        if(!obj.ownerId){
            throw new ValidationError('Właściciel zadania nie może być pusty.')
        }


        this.id = obj.id;
        this.title = obj.title;
        this.description = obj.description;
        this.isClosed = obj.isClosed;
        this.ownerId = obj.ownerId;
    }

    static async getOne(id: string) : Promise<TodoEntity | null> {

        const [results] = await pool.execute("SELECT * FROM `tasks` WHERE id = :id", {
            id,
        }) as TodoRecordResults;

        return  results.length > 0 ? new TodoRecord(results[0]) : null;
    }
    static async countAll(ownerId: string, searchText: string, isClosed?:boolean): Promise<number> {

        let sqlQuery = "SELECT count(*) as countRows FROM `tasks`  WHERE `title` LIKE :search AND ownerId = :ownerId ";

        if (isClosed !== null && isClosed === true){
            sqlQuery = "SELECT count(*) as countRows FROM `tasks`  WHERE `title` LIKE :search AND ownerId = :ownerId AND isClosed = 1 ";
        }

        if (isClosed !== null && isClosed === false){
            sqlQuery = "SELECT count(*) as countRows FROM `tasks`  WHERE `title` LIKE :search AND ownerId = :ownerId AND isClosed = 0 ";
        }

        const [pagesCount] = await pool.execute(sqlQuery, {
            ownerId,
            search: `%${searchText}%`,
        }) ;

        return (pagesCount as RowDataPacket)[0].countRows;
    }
    static async findAll(ownerId: string, pageNumber: number, pageSize: number, searchText: string, isClosed?:boolean) : Promise<TodoEntityDto[]> {

        let sqlQuery = "SELECT * FROM `tasks`  WHERE `title` LIKE :search AND ownerId = :ownerId LIMIT :skip,:rows";

        if (isClosed !== null && isClosed === true){
            sqlQuery = "SELECT * FROM `tasks`  WHERE `title` LIKE :search AND ownerId = :ownerId AND isClosed = 1 LIMIT :skip,:rows";
        }

        if (isClosed !== null && isClosed === false){
            sqlQuery = "SELECT * FROM `tasks`  WHERE `title` LIKE :search AND ownerId = :ownerId AND isClosed = 0 LIMIT :skip,:rows";
        }

        const [results] = await pool.execute(sqlQuery, {
            search: `%${searchText}%`,
            ownerId,
            rows: pageSize,
            skip: (pageNumber - 1) * pageSize,
        }) as TodoRecordResults;

        return results.map(result => {
            const {id, title, description, isClosed, ownerId} = result;
            return {
                id, title, description,isClosed
            };
        });
    }

    async insert(): Promise<string>{
        if(!this.id){
            this.id = uuid();
        }else
        {
            throw new ValidationError('Cannot insert something that is already inserted');
        }
        await pool.execute("INSERT INTO `tasks` (`id`,`title`,`description`, `isClosed`, `ownerId`) VALUES (:id, :title, :description, :isClosed, :ownerId)", this);

        return this.id;
    }

    static async delete(id: string): Promise<void>{
        await pool.execute("DELETE FROM `tasks` WHERE id = :id",{
            id,
        })
    }

    async close(): Promise<void>{
        await pool.execute("UPDATE `tasks` SET `isClosed` = 1 WHERE id = :id",{
            id: this.id,
        })
    }

    async update(): Promise<void> {
        await pool.execute("UPDATE `tasks` SET `title` = :title, `description` = :description, `isClosed` = :isClosed WHERE `id` = :id",{
            id: this.id,
            title: this.title,
            description: this.description,
            isClosed: this.isClosed
        })
    }

}