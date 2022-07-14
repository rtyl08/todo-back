import {Router} from "express";
import {TodoRecord} from "../records/todo.record";
import {OwnerRecord} from "../records/owner.record";


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

        const entity = await TodoRecord.getOne(taskId)

        if (entity.ownerId !== req.session.ownerid) {
            res.status(401).json({"message": "Brak uprawnień do wykonania tej operacji."});
            return;
        }else{
            const {id, title, description, isClosed} = entity;
            res.status(200).json({id, title, description, isClosed});
        }
    })

    .get('/', async (req, res) => {

        //const {pageNumber, pageSize} = req.query;

        const owner = await OwnerRecord.getOneById(req.session.ownerid);

        if (owner !== null) {
            const tasks = await TodoRecord.findAll(owner.id);
            res.json(tasks.map(result => {
                const {id, title, description, isClosed} = result;
                return {
                    id, title, description,isClosed
                }}));
        }else{
            res.json([]);
        }
    })

    .post('/', async (req, res) => {
        const ownerId = req.session.ownerid;
        const owner = await OwnerRecord.getOneById(ownerId);

        if (owner !== null){
            const todo = new TodoRecord({...req.body, ownerId} );
            await todo.insert();

            const {id, title, description, isClosed} = todo;
            res.json({id, title, description, isClosed});
        }else{
            res.json([]);
        }

    })

    .post('/search', async (req, res) => {

        const owner = await OwnerRecord.getOneById(req.session.ownerid);

        if (owner !== null) {
            const tasks = await TodoRecord.searchAll(req.body.name ?? '', owner.id);
            res.json(tasks.map(result => {
                const {id, title, description, isClosed} = result;
                return {
                    id, title, description,isClosed
                }}));
        }else{
            res.json([]);
        }
    })

    .put('/', async (req, res) => {
        const {id, title, description, isClosed} = req.body;

        const entity = await TodoRecord.getOne(id);

        if (entity !== null){

            if (entity.ownerId !== req.session.ownerid) {
                res.status(401).json({"message": "Brak uprawnień do wykonania tej operacji."});
                return;
            }

            const record = new TodoRecord({id, title, description, isClosed, ownerId: req.session.ownerid});
            await record.update();

            res.status(200).json({"messgae": `Aktualizacja zadanie ${id} zakończona pomyślnie`});
        }

        res.status(404).json({"messgae": `Zadanie ${id} nie istnieje`})
    })

    .patch('/close/:id', async (req, res) =>{
        const {id} = req.params;

        const entity = await TodoRecord.getOne(id);

        if(entity !== null){

            if (entity.ownerId !== req.session.ownerid) {
                res.status(401).json({"message": "Brak uprawnień do wykonania tej operacji."});
                return;
            }

            const record = await new TodoRecord(entity);
            try {
                await record.close();
            }catch (e){
                console.log(e);
            }

            res.status(200).json({"message":`Zadanie ${id} zamknięte.`});

        }else{
            res.status(404).json({"message":`Zadanie ${id} nie istnieje.`});
        }
    })

    .delete('/:id', async (req, res) =>{
            const {id} = req.params;

            const entity = await TodoRecord.getOne(id);

            if (entity !== null){

                if (entity.ownerId !== req.session.ownerid){
                    res.status(401).json({"message":"Brak uprawnień do wykonania operacji."});
                    return;
                }

                const record = await new TodoRecord(entity);
                record.delete();
                res.status(200).json({"message":`Zadanie ${id} usunięte pomyślnie.`});
            }else{
                res.status(404).json({"message":`Zadanie ${id} nie istnieje.`});
            }

    })