import {TodoEntity} from "../types";
import {ValidationError} from "../utils/errors";
import {pool} from "../utils/db";
import {FieldPacket} from "mysql2";
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

        console.log(obj);

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

    static async findAll(ownerId: string) : Promise<TodoEntity[]> {

        const [results] = await pool.execute("SELECT * FROM `tasks` WHERE ownerId = :ownerId ", {
            ownerId,
        }) as TodoRecordResults;

        return results.map(result => {
            const {id, title, description, isClosed, ownerId} = result;
            return {
                id, title, description,isClosed,ownerId
            };
        });
    }

    static async searchAll(title: string, ownerId: string) : Promise<TodoEntity[]> {

        const [results] = await pool.execute("SELECT * FROM `tasks` WHERE ownerId = :ownerId AND `title` LIKE :search", {
            search: `%${title}%`,
            ownerId,
        }) as TodoRecordResults;

        return results.map(result => {
            const {id, title, description, isClosed, ownerId} = result;
            return {
                id, title, description,isClosed,ownerId
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

    async delete(): Promise<void>{
        await pool.execute("DELETE FROM `tasks` WHERE id = :id",{
            id: this.id,
        })
    }

    async close(): Promise<void>{
        await pool.execute("UPDATE `tasks` SET `isClose` = 1 WHERE id = :id",{
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