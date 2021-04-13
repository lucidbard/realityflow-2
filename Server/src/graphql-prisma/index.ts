import { prisma } from "../server"
import { ServerEventDispatcher } from "../server"
import { StateTracker } from "../FastAccessStateTracker/StateTracker"
import { FlowObject } from "../FastAccessStateTracker/FlowLibrary/FlowObject"
import { FlowBehaviour } from "../FastAccessStateTracker/FlowLibrary/FlowBehaviour"
// import { FlowObject } from "../FastAccessStateTracker/FlowLibrary/FlowObject"
// import { FlowVSGraph } from "../FastAccessStateTracker/FlowLibrary/FlowVSGraph"
// import { FlowProject } from "../FastAccessStateTracker/FlowLibrary/FlowProject"


const resolvers = {
  Query: {
    behaviour: async (parent, args, context) => {
      return context.prisma.behaviour.findMany()
    },

    user: async (parent, args, context) => {
      return context.prisma.user.findMany({ include: { project: { include: { user: true, db_object: true } } } })
    },

    project: async (parent, args, context) => {

      return context.prisma.project.findMany({ include: { user: true, db_object: true } })
    },

    object: async (parent, args, context) => {
      return context.prisma.db_object.findMany({ include: { project: true, user:true } })
    },

  },

  Mutation: {
    createBehaviour: (parent, args, context, info) => {
      const newBehaviour = context.prisma.behaviour.create({
        data: {
          Id: args.Id,
          TypeOfTrigger: args.TypeOfTrigger,
          TriggerObjectId: args.TriggerObjectId,
          TargetObjectId: args.TargetObjectId,
          ProjectId: args.ProjectId,
          NextBehaviour: args.NextBehaviour,
          Action: JSON.stringify(args.Action),
        },
      })

      //StateTracker.CreateBehaviour(<FlowBehaviour>args, args.ProjectId)
      return newBehaviour
    },

    updateBehaviour: (parent, args, context, info) => {
      const updated_Behaviour = context.prisma.behaviour.update({
        data: {
          TypeOfTrigger: args.TypeOfTrigger,
          TriggerObjectId: args.TriggerObjectId,
          TargetObjectId: args.TargetObjectId,
          ProjectId: args.ProjectId,
          NextBehaviour: args.NextBehaviour,
          Action: args.Action,
        },
        where: { Id: args.Id }
      })
      return updated_Behaviour
    },

    deleteBehaviour: (parent, args, context, info) => {
      const delete_behaviour = context.prisma.behaviour.delete({
        where: { Id: args.Id }
      })
      return delete_behaviour
    },

    createUser: async (_, args, context, __) => {
      console.log(args.input)
      let DateModified = new Date().toISOString();
      const newuser = await context.prisma.user.create({
        include: {
          project: true
        },
        data: {
          Username: args.Username,
          Password: args.Password,
          // project: {
          //   create: [{...args.input[0],DateModified}]
          // }
        },
      })
      return newuser
    },

    updateUser: (parent, args, context, info) => {
      const updated_user = context.prisma.user.update({
        data: {
          Username: args.Username,
          Password: args.Password,
          //projects: args.projects
        },
        where: { Username: args.Username }
      })
      return updated_user
    },

    deleteUser: (parent, args, context, info) => {
      const finish = prisma.user.findMany({ 
        include: { 
          project: { 
            include: { 
              user: true, db_object: true 
            } 
          } 
        } 
      })
    },

    createProject: (parent, args, context, info) => {
      const create_project = context.prisma.project.create({
        data: {
          Id: args.Id,
          Description: args.Description,
          ProjectName: args.ProjectName,
          DateModified: new Date().toISOString(),
          ownerUsername: args.ownerUsername
        },
        include: {
          user: true,
          db_object: true
        }
      })
      return create_project
    },

    updateProject: (parent, args, context, info) => {
      const update_project = context.prisma.project.update({
        data: {
          Description: args.Description,
          ProjectName: args.ProjectName,
          DateModified: new Date().toISOString(),
          ownerUsername: args.ownerUsername
        },
        where: { Id: args.Id }
      })
      return update_project
    },

    deleteProject: async (parent, args, context, info) => {
      const deleteProjObj = context.prisma.db_object.deleteMany({
        where: {
          projectId: args.Id,
        }
      })

      const deleteProj = context.prisma.project.delete({
        where: {
          Id: args.Id,
        }
      })

      const [result1, result2] = await prisma.$transaction([deleteProjObj, deleteProj])
      return result2

    },

    createObject: async (_, args, context, __) => {
      const create_object = context.prisma.db_object.create({
        data: {
          Id: args.Id,
          Name: args.Name,
          X: args.X,
          Y: args.Y,
          Z: args.Z,
          Q_x: args.Q_x,
          Q_y: args.Q_y,
          Q_z: args.Q_z,
          Q_w: args.Q_w,
          S_x: args.S_x,
          S_y: args.S_y,
          S_z: args.S_z,
          R: args.R,
          G: args.G,
          B: args.B,
          A: args.A,
          Prefab: args.Prefab,
          projectId: args.projectId,
        },
        include: {
          project: true
        }
      })
      // FAM Access
      StateTracker.CreateObject(<FlowObject>args, args.projectId)
      // TalkToClients(createObjFAM);
      // let response = await FAMaccess(1, args)
      // if(response == true)
      // {
      //   console.log("Yes! we got a response and I think GraphQL worked!")
      // }

      return create_object
    },

    updateObject: (_, args, context, __) => {
      const update_object = context.prisma.db_object.update({
        data: {
          Name: args.Name,
          X: args.X,
          Y: args.Y,
          Z: args.Z,
          Q_x: args.Q_x,
          Q_y: args.Q_y,
          Q_z: args.Q_z,
          Q_w: args.Q_w,
          S_x: args.S_x,
          S_y: args.S_y,
          S_z: args.S_z,
          R: args.R,
          G: args.G,
          B: args.B,
          A: args.A,
          Prefab: args.Prefab,
          projectId: args.projectId,
        },
        where: { Id: args.Id }
      })
      return update_object
    },

    deleteObject: async (_, args, context, __) => {
      const delete_object = context.prisma.db_object.delete({
        where: {
          Id: args.Id
        }
      })
      
      // FAM Access
      StateTracker.DeleteObject(args.Id, args.projectId, _)
      // TalkToClients(deleteObjFAM)
      // let response = await FAMaccess(2, args)
      // if(response == true)
      // {
      //   console.log("Yes! we got a response and I think GraphQL worked!")
      // }
      // return delete_object
    },


    createVSGraph: (_, args, context, __) =>{
      const create_VSGraph = context.prisma.vs_graph.create({
        data: {
          Name:              args.Name,
          serializedNodes:   args.serializedNodes,
          edges:             args.edges,
          groups:            args.stackNodes,
          stackNodes:        args.stackNodes,
          pinnedElements:    args.pinnedElements,
          exposedParameters: args.exposedParameters,
          stickyNotes:       args.stickyNotes,
          position:          args.position,
          scale:             args.scale,
          references:        args.references,
          projectId:         args.projectId,
          project:           args.project
        },
        include: {
          project: true
        }

      })
      return create_VSGraph;
    },

    updateVSGraph: (_, args, context, __) =>{
      const update_VSGraph = context.prisma.vs_graph.update({
        data: {
          Name:              args.Name,
          serializedNodes:   args.serializedNodes,
          edges:             args.edges,
          groups:            args.stackNodes,
          stackNodes:        args.stackNodes,
          pinnedElements:    args.pinnedElements,
          exposedParameters: args.exposedParameters,
          stickyNotes:       args.stickyNotes,
          position:          args.position,
          scale:             args.scale,
          references:        args.references,
          projectId:         args.projectId,
          project:           args.project
        },
        where: { Id: args.Id }

      })
      return update_VSGraph;
    },

    deleteVSGraph: (_, args, context, __) =>{
      const delete_VSGraph = context.prisma.vs_graph.delete({
        where: {
          Id: args.Id
        }
      })
      return delete_VSGraph
    }


  }
}

async function FAMaccess (FAM : number, args)
{
  switch(FAM) // Choosing which FAM Operation needs to be executed.
  {
    case 1:
      var res1 = await StateTracker.CreateObject(<FlowObject>args, args.projectId)
      TalkToClients(res1);
      break;

    case 2:
      var res2 = await StateTracker.DeleteObject(args.Id, args.projectId, "none")
      TalkToClients(res2)
      break;
  }

  return true;
}

 function TalkToClients(res: any){

  let clients = res[1];

  if(!clients)
  {
      console.log("Didn't receive a clients array [We're in Apollo]");
  }
  else
  {
      for(var i = 0; i < clients.length; i++)
      {
          let key = clients[i];
          ServerEventDispatcher.SocketConnections.get(key).send(res[0]);
      }
  }
}

module.exports = {resolvers}
export { TalkToClients };
export { TalkToClients as BacktoGraphQL };