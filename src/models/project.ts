import * as mongoose from "mongoose";
import Schema = mongoose.Schema;
import Types = Schema.Types;
import ObjectId = Types.ObjectId;
import ObjectIdType = mongoose.Types.ObjectId;
import { User } from "./user";
import { Object } from "./object";
import { Client } from "./client";


export declare interface IProjectModel extends mongoose.Document{
    [x: string]: any;

    projectName:    String;
    owner:          ObjectIdType;
    clients:        [ObjectIdType];
    objs:           [ObjectIdType];
   /* currentScene:   ObjectIdType;
    prevScene:      [ObjectIdType];
    nextScene:      [ObjectIdType];
    bookmarks:      [ObjectIdType]; */
    created:        Date;
    lastEdit:       Date;
    lastEditor:     ObjectIdType;


}


const projectSchema = new mongoose.Schema({

    projectName:    String,
    owner:          {type: ObjectId, ref: User},
    clients:        {type: ObjectId, ref: Client},
    objs:        [{type: ObjectId, ref: Object}],
   /* currentScene:   {type: ObjectId, ref: Scene},
    prevScene:      [{type: ObjectId, ref: Scene}],
    nextScene:      [{type: ObjectId, ref: Scene}],
    bookmarks:      [{type: ObjectId, ref: Scene}], */
    created:        Date,
    lastEdit:       Date,
    lastEditor:     {type: ObjectId, ref: User},

});


export const Project = mongoose.model<IProjectModel>("Project", projectSchema);