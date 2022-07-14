import {Router} from "express";
import {TodoRecord} from "../records/todo.record";
import {OwnerRecord} from "../records/owner.record";
import {ValidationError} from "../utils/errors";
import {OwnerEntity, TodoEntity, TodoResultsDto} from "../types";


export const todoRouter = Router();

todoRouter
    .all('*', (req, res, next)=>{

        if(!req.session.ownerid) {
            res.status(401).json({message:"Sessja wygasła. Proszę zalogować się"});
            return;
        }
        next();
    })

    .get('/:id', async (req, res) =>{
        const taskId = req.params.id;

        const todoEntity: TodoEntity = await TodoRecord.getOne(taskId)

        if (todoEntity.ownerId !== req.session.ownerid) {
            res.status(401).json({"message": "Brak uprawnień do wykonania tej operacji."});
            return;
        }else{
            const {id, title, description, isClosed} = todoEntity;
            res.status(200).json({id, title, description, isClosed});
        }
    })

    .get('/', async (req, res) => {

        const {pageNumber, pageSize, isClosed , searchText} = req.query;

        const searchTextParam : string = searchText === undefined ? '' : String(searchText);
        const isClosedParam: null | boolean = isClosed === undefined ? null : isClosed === '1' ? true : false;

        if (Number.isInteger(Number(pageNumber)) &&
            Number.isInteger(Number(pageSize))){

            const pageNumberParam: number = Number(pageNumber);
            const pageSizeParam: number = Number(pageSize);
            const searchTextParam: string = String(searchText ?? '');
            const ownerEntity  = await OwnerRecord.getOneById(req.session.ownerid);

            if (ownerEntity !== null) {
                const tasksEntityDto = await TodoRecord.findAll(ownerEntity.id, pageNumberParam, pageSizeParam, searchTextParam, isClosedParam);

                const countRows: number = await TodoRecord.countAll(ownerEntity.id, searchTextParam, isClosedParam);
                const pagesCount: number = Math.ceil(countRows / Number(pageSize));

                const result: TodoResultsDto = {
                    pagesCount,
                    pageNumber: pageNumberParam,
                    pageSize: pageSizeParam,
                    tasks: tasksEntityDto
                };

                res.json(result);

            }else{

                const result: TodoResultsDto = {
                    pagesCount: 0,
                    pageNumber: pageNumberParam,
                    pageSize: pageSizeParam,
                    tasks: []
                };

                res.json(result);
            }

        }else{
            res.status(400).json({"message":"Brak wymaganego parametru"});
        }
    })

    .post('/', async (req, res) => {
        const ownerId = req.session.ownerid;
        const ownerEntity: OwnerEntity = await OwnerRecord.getOneById(ownerId);

        if (req.body.isClosed === 0 || req.body.isClosed === 1) {
            if (ownerEntity !== null) {
                const todoRecord: TodoRecord = new TodoRecord({...req.body, ownerId});
                await todoRecord.insert();

                const {id, title, description, isClosed} = todoRecord;
                res.location(`/task/${id}`);
                res.json({id, title, description, isClosed});

            } else {
                res.status(401).json({"message": "Brak uprawnień do wykonania tej operacji."});
            }
        }else{
            throw  new ValidationError("Właściwość isClosed możę przyjmować tylko dwie wartości: 0 lub 1");
        }

    })

    .put('/', async (req, res) => {
        const {id, title, description, isClosed} = req.body;

        if (isClosed === 0 || isClosed === 1) {

            const todoEntity: TodoEntity = await TodoRecord.getOne(id);

            if (todoEntity !== null) {

                if (todoEntity.ownerId !== req.session.ownerid) {
                    res.status(401).json({"message": "Brak uprawnień do wykonania tej operacji."});
                    return;
                }

                const record = new TodoRecord({id, title, description, isClosed, ownerId: req.session.ownerid});
                await record.update();

                res.status(200).json({"messgae": `Aktualizacja zadanie ${id} zakończona pomyślnie`});
            }else{
                res.status(404).json({"messgae": `Zadanie ${id} nie istnieje`})
            }

        }else{
            throw  new ValidationError("Właściwość isClosed możę przyjmować tylko dwie wartości: 0 lub 1");
        }
    })

    .patch('/close/:id', async (req, res) =>{
        const {id} = req.params;

        const todoEntity: TodoEntity = await TodoRecord.getOne(id);

        if(todoEntity !== null){

            if (todoEntity.ownerId !== req.session.ownerid) {
                res.status(401).json({"message": "Brak uprawnień do wykonania tej operacji."});
                return;
            }

             const todoRecord : TodoRecord = await new TodoRecord(todoEntity);

             await todoRecord.close();

            res.status(200).json({"message":`Zadanie ${id} zamknięte.`});

        }else{
             res.status(404).json({"message":`Zadanie ${id} nie istnieje.`});
         }

    })

    .delete('/:id', async (req, res) =>{
        const {id} = req.params;
        const todoEntity: TodoEntity = await TodoRecord.getOne(id);



        if (todoEntity !== null){
            if (todoEntity.ownerId !== req.session.ownerid){
                res.status(401).json({"message": "Brak uprawnień do wykonania tej operacji."});
                return;
            }
            await TodoRecord.delete(todoEntity.id);

            res.status(200).json({"message":`Zadanie ${id} usunięte pomyślnie.`});
        }else{
            res.status(404).json({"message":`Zadanie ${id} nie istnieje.`});
        }

    });
