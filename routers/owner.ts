import {Router} from "express";
import {OwnerRecord} from "../records/owner.record";
import {ValidationError} from "../utils/errors";
import * as bcrypt from "bcrypt";


export const ownerRouter = Router();

ownerRouter

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

        const {name, password1, password2} = req.body;

        const owner = await OwnerRecord.getOne(name);
        if(!owner)
            res.status(409).json({"message":`Bład rejestarcji. Użytkownik o nazwie ${name} już istnieje.`});

        if (password1 === password2){

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);

            try {
                const hashedPassword = await bcrypt.hash(password1, salt);
                const owner = new OwnerRecord({name, password: hashedPassword});
                await owner.insert();
                req.session.ownerid=owner.id;

            } catch(err) {
                res.status(500).json({"message":"Błąd rejestracji użytkownika"});
            }

            res.status(201).json({"message":"Record użytkownika pomyślnie założony"});

        }else{
            throw new ValidationError('Hasło i powtórzone hasło są niezgodne');
        }

    })