import {Router} from "express";
import {TodoRecord} from "../records/todo.record";
import {OwnerRecord} from "../records/owner.record";

export const todoRouter = Router();

todoRouter
    .all('*', (req, res, next) =>{
        if(!req.session.ownerid) {
            res.statusCode = 403;
            res.json({"message":"Sessia wygasła. Proszę zalogować się"});
            return;
        }
        next();
    })
    .get('/search/:name?', async (req, res) => {

        const owner = await OwnerRecord.getOneById(req.session.ownerid);

        if (owner !== null) {
            const tasks = await TodoRecord.findAll(req.params.name ?? '');
            res.json(tasks);
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