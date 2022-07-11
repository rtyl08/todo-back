import {Router} from "express";
import {OwnerRecord} from "../records/owner.record";
import {ValidationError} from "../utils/errors";

export const ownerRouter = Router();

ownerRouter

    .post('/login', async (req, res) => {

        const owner = await OwnerRecord.getOne(req.body.name);

        if (owner !== null){
            req.session.ownerid = owner.id;
            res.json({"message":"Logowanie pomyślne"});
        }else{
            res.json({"message":"Błąd logowania"});
        }
    })

    .get('/logout', async (req, res) => {

            req.session = null;
            res.json({"message": "pomyślnie wylogowanie"});
    })

    .post('/signin', async (req, res) => {

        const {name, password1, password2} = req.body;

        console.log(req.cookies.ownerId);

        if (password1 === password2){
            const owner = new OwnerRecord({name, password: password1});
            await owner.insert();

            req.session.admin=owner.id;
            res.json({"message":"Record pomyślnie założony"});

        }else{
            throw new ValidationError('Hasło i powtórzone hasło są niezgodne');
        }

    })