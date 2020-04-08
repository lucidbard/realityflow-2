

import { FlowProject } from "../FlowLibrary/FlowProject";
import { FlowUser } from "../FlowLibrary/FlowUser";
import { FlowObject } from "../FlowLibrary/FlowObject";
import { FlowBehavior } from "../FlowLibrary/FlowBehavior";


import { ProjectOperations } from "../../ORMCommands/project"
import { ObjectOperations } from "../../ORMCommands/object"
import { UserOperations } from "../../ORMCommands/user"
import { BehaviorOperations } from "../../ORMCommands/behavior"

import { DBObject } from "../../entity/object";
import { Project } from "../../entity/project";
/**
 * Implementation of Mongoose Database
 */
export default class TypeORMDatabase
{
    
  public constructor(url: string){}
    

  // Project functions
  public static async CreateProject(projectToCreate: FlowProject, user: string) {

    let projectId = await ProjectOperations.createProject(projectToCreate, user);
    
    return await ProjectOperations.findProject(projectId);
  }

  /**
  * Deletes the project and all its objects from the database
  * This works because deletes cascade
  */
  public static async DeleteProject(projectToDeleteId: string): Promise<void> {
    
    await ProjectOperations.deleteProject(projectToDeleteId);
    return;
  }

  public static async UpdateProject(projectToUpdate: FlowProject): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public static async GetProject(projectId: string): Promise<FlowProject> {
    let project = await ProjectOperations.findProject(projectId);

    if(!project)
      return null;

    let objects = await ProjectOperations.getObjects(projectId);
    
    let returnProject = new FlowProject(project);
    
    returnProject._ObjectList = objects.map((val, index, arr) => new FlowObject(val))
    
    return returnProject;
  }

  // User functions
  /** 
  * Create a User in the database
  */
  public static async CreateUser(username: string, password: string): Promise<void> {
    var newUser = await UserOperations.createUser(username, password);
  }

  /** 
  * Delete a User from the database
  */
  public static async DeleteUser(userToDelete: string): Promise<void> {
    await UserOperations.deleteUser(userToDelete);
  }


  /**
  * Get a user based on their username 
  */
  public static async GetUser(Username: string): Promise<FlowUser> {
    
    let UserProjects = await ProjectOperations.fetchProjects(Username)
    let projects = UserProjects.map((val, index, list) => val.Id)

    return new FlowUser(Username, undefined, projects) 
  }

  public static async fetchProjects(Username: string): Promise<Array<Project>>{
    return ( await ProjectOperations.fetchProjects(Username))
  }

  /**
   * Authenticate a user based on username and password
   * @param Username 
   * @param Password 
   */
  public static async AuthenticateUser(Username: string, Password: string): Promise<Boolean>{
    let user = await UserOperations.authenticateUser(Username, Password)
    
    if(!user)
      return false

    return true
  }


  // Object functions


  /**
  *  Create an object and add it to a pre-existing project in the database
  *  Assumes that the project already exists
  */
  public static async CreateObject(objectToCreate: FlowObject, projectId: string){
    await ObjectOperations.createObject(objectToCreate, projectId);
  }

  /** Delete an object from a project in the database*/

  public static async DeleteObject(objectId:string, projectId: string): Promise<void> {
    await ObjectOperations.deleteObject(objectId, projectId)
  }

  /**Update a given object */
  public static async UpdateObject(objectToUpdate: FlowObject, projectId: string): Promise<void> {
    await ObjectOperations.updateObject(objectToUpdate, projectId);
  }
  
  /**Get an object from the database */
  public static async GetObject(ObjectId: string, projectId: string): Promise<FlowObject> {
    return new FlowObject(await ObjectOperations.findObject(ObjectId, projectId))
  }


  // Behavior functions
  /**
  *  Create an Behavior and add it to a pre-existing project in the database
  *  Assumes that the project already exists
  */
  public static async CreateBehavior(behaviorToCreate: FlowBehavior){
    let ret:any = {};
    ret.Id = behaviorToCreate.Id;
    ret.TypeOfTrigger = behaviorToCreate.TypeOfTrigger
    ret.TriggerObjectId = behaviorToCreate.TriggerObjectId;
    ret.TargetObjectId = behaviorToCreate.TargetObjectId;
    ret.ActionParameters = JSON.stringify(behaviorToCreate.Action)
    ret.NextBehavior = JSON.stringify(behaviorToCreate.NextBehavior);
    ret.ProjectId = behaviorToCreate.ProjectId
    console.log(behaviorToCreate.Action)
    
    await BehaviorOperations.CreateBehavior(ret);
  }

  /** Delete a behavior chain from a project in the database*/
  public static async DeleteBehavior(behaviorId: string): Promise<void> {
    await BehaviorOperations.deleteBehavior(behaviorId);
  }

  public static async UpdateBehavior(behaviorToUpdate): Promise<void>{
    let ret:any = {};
    ret.Id = behaviorToUpdate.Id;
    ret.TypeOfTrigger = behaviorToUpdate.TypeOfTrigger
    ret.TriggerObjectId = behaviorToUpdate.TriggerObjectId;
    ret.TargetObjectId = behaviorToUpdate.TargetObjectId;
    ret.ActionParameters = JSON.stringify(behaviorToUpdate.Action)
    ret.NextBehavior = JSON.stringify(behaviorToUpdate.NextBehavior);
    ret.ProjectId = behaviorToUpdate.ProjectId
    await BehaviorOperations.updateBehavior(ret)
  }

  public static async getBehaviors(projectId){
    let behaviors = await BehaviorOperations.getBehaviors(projectId);
    let flowBehaviors = behaviors.map((behavior)=>{
      let ret:any = {};
      ret.Id = behavior.Id;
      ret.TypeOfTrigger = behavior.TypeOfTrigger
      ret.TriggerObjectId = behavior.TriggerObjectId;
      ret.TargetObjectId = behavior.TargetObjectId;
      ret.Action = JSON.parse(behavior.ActionParameters)
      ret.NextBehavior = JSON.parse(behavior.NextBehavior);
      ret.ProjectId = behavior.ProjectId
      return ret;
    })
    return flowBehaviors;
  }
}
export {TypeORMDatabase};