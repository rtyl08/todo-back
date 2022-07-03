import {TodoEntity} from "../types";
import {ValidationError} from "../utils/errors";

interface NewTodoEntity extends Omit<TodoEntity, 'id'>{
    id?: string;
}

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

        this.title = obj.title;
        this.description = obj.description;
        this.isClosed = false;
        this.ownerId = obj.ownerId;
    }


}