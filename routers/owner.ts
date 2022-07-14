import {Router} from "express";
import {OwnerRecord} from "../records/owner.record";
import {ValidationError} from "../utils/errors";
import * as bcrypt from "bcrypt";

export const ownerRouter = Router();

ownerRouter
    .get('/', async ( req, res) => {

        if(!req.session.ownerid) {
            res.status(401).json({message:"Sessja wygasła. Proszę zalogować się"});
            return;
        }

        const ownerEntity = await OwnerRecord.getOneById(req.session.ownerid);

        if (ownerEntity){

                res.status(200).json({
                    name: ownerEntity.name,
                    fullName: ownerEntity.fullName,
                });

        }else {
            res.status(404).json({"message": `Rekord nie istnieje.`});
        }
    })

    .delete('/', async ( req, res) => {

        if(!req.session.ownerid) {
            res.status(401).json({message:"Sessja wygasła. Proszę zalogować się"});
            return;
        }

        const ownerEntity = await OwnerRecord.getOneById(req.session.ownerid);

        if (ownerEntity){
            await OwnerRecord.delete(req.session.ownerid);
            req.session = null;
            res.status(200).json({"message": `Pomyślnie usunięto rekord.`});
        }else {
            res.status(404).json({"message": `Rekord nie istnieje.`});
        }
    })

    .post('/login', async (req, res) => {

        const {name, password} = req.body;

        const owner = await OwnerRecord.getOne(name);

        if (owner !== null){
            if (await bcrypt.compare(password, owner.password)) {

                req.session.ownerid = owner.id;
                res.status(200).json({"message":"Logowanie pomyślne"});

            }else{
                res.status(400).json({"message":"Błąd nazwy użytkownika lub hasła"});
            }

        }else{
            res.status(400).json({"message":"Błąd nazwy użytkownika lub hasła"});
        }
    })

    .get('/logout', async (req, res) => {

            req.session = null;
            res.json({"message": "Pomyślnie wylogowanie"});
    })

    .post('/register', async (req, res) => {

        const {name, fullName, password1, password2} = req.body;
        const owner = await OwnerRecord.getOne(name);

        if(owner) {
            res.status(409).json({"message": `Bład rejestarcji. Użytkownik o nazwie ${name} już istnieje.`});
            return;
        }

        if (password1 === password2){

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);

                const hashedPassword = await bcrypt.hash(password1, salt);
                const owner = new OwnerRecord({name, fullName, password: hashedPassword});
                await owner.insert();
                req.session.ownerid=owner.id;

            res.status(201).json({"message":"Record użytkownika pomyślnie założony"});

        }else{
            throw new ValidationError('Hasło i powtórzone hasło są niezgodne');
        }

    })