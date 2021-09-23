"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandContext = void 0;
const StateTracker_1 = require("../StateTracker");
const FlowProject_1 = require("../FlowLibrary/FlowProject");
const FlowObject_1 = require("../FlowLibrary/FlowObject");
const FlowAvatar_1 = require("../FlowLibrary/FlowAvatar");
const FlowBehaviour_1 = require("../FlowLibrary/FlowBehaviour");
const FlowVSGraph_1 = require("../FlowLibrary/FlowVSGraph");
const FlowNodeView_1 = require("../FlowLibrary/FlowNodeView");
const MessageBuilder_1 = require("./MessageBuilder");
const uuid_1 = require("uuid");
const server_1 = require("../../server");
class Command_CreateProject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            data.FlowProject.Id = uuid_1.v4();
            let project = new FlowProject_1.FlowProject(data.FlowProject);
            let returnData = yield StateTracker_1.StateTracker.CreateProject(project, data.FlowUser.Username, client);
            let message = returnData[0] == null ? "Failed to Create Project" : returnData[0];
            let returnContent = {
                "MessageType": "CreateProject",
                "WasSuccessful": returnData[0] == null ? false : true,
                "FlowProject": message
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_ReadProject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.ReadProject(data.FlowProject.Id, client);
            let message = returnData[0] == null ? "Failed to Read Project" : returnData[0];
            let returnContent = {
                "MessageType": "ReadProject",
                "WasSuccessful": returnData[0] == null ? false : true,
                "FlowProject": message
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_DeleteProject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.DeleteProject(data.FlowProject.Id, data.FlowUser.Username, client);
            let returnContent = {
                "MessageType": "DeleteProject",
                "WasSuccessful": returnData[0],
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_OpenProject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.OpenProject(data.ProjectId, data.FlowUser.Username, client);
            Command_OpenProject.SendRoomAnnouncement(returnData[2], "UserJoinedRoom");
            let returnContent = {
                "MessageType": "OpenProject",
                "WasSuccessful": returnData[0] == null ? false : true,
                "FlowProject": returnData[0],
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
    static SendRoomAnnouncement(roomBulletin, messageType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (roomBulletin) {
                let roomMessage = roomBulletin[0];
                let message = {
                    "MessageType": messageType,
                    "Message": roomMessage,
                };
                let roomClients = roomBulletin[1];
                for (let i = 0; i < roomClients.length; i++) {
                    let clientSocket = server_1.ServerEventDispatcher.SocketConnections.get(roomClients[i]);
                    server_1.ServerEventDispatcher.send(JSON.stringify(message), clientSocket);
                }
            }
        });
    }
}
class Command_FetchProjects {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.FetchProjects(data.FlowUser.Username, client);
            let message = returnData[0] == null ? "Failed to fetch projects" : returnData[0];
            let returnContent = {
                "MessageType": "FetchProjects",
                "WasSuccessful": returnData[0] == null ? false : true,
                "Projects": message
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_LeaveProject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.LeaveProject(data.ProjectId, data.FlowUser.Username, client);
            Command_OpenProject.SendRoomAnnouncement(returnData[2], "UserLeftRoom");
            let message = returnData[0] == false ? "Failed to Leave Project" : "Successfully Left Project";
            let returnContent = {
                "MessageType": "LeaveProject",
                "WasSuccessful": returnData[0]
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_CreateUser {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.CreateUser(data.FlowUser.Username, data.FlowUser.Password, client);
            let returnContent = {
                "MessageType": "CreateUser",
                "WasSuccessful": returnData[0]
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_DeleteUser {
    ExecuteCommand(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.DeleteUser(data.FlowUser.Username, data.FlowUser.Password);
            let returnContent = {
                "MessageType": "DeleteUser",
                "WasSuccessful": returnData[0]
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_LoginUser {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.LoginUser(data.FlowUser.Username, data.FlowUser.Password, client);
            let returnContent = {
                "MessageType": "LoginUser",
                "WasSuccessful": returnData[0],
                "Projects": returnData[2]
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_LogoutUser {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.LogoutUser(data.FlowUser.Username, data.FlowUser.Password, client);
            let returnContent = {
                "MessageType": "LogoutUser",
                "WasSuccessful": returnData[0]
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_ReadUser {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.ReadUser(data.FlowUser.Username, client);
            let returnContent = {};
            if (returnData[0] == null) {
                returnContent = {
                    "MessageType": "ReadUser",
                    "WasSuccessful": false
                };
            }
            else {
                returnContent = {
                    "MessageType": "ReadUser",
                    "WasSuccessful": true,
                    "FlowUser": returnData[0]
                };
            }
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_CreateRoom {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let projectID = data.ProjectID;
            let returnData = yield StateTracker_1.StateTracker.CreateRoom(projectID, client);
            let returnContent = {
                "MessageType": "CreateRoom",
                "WasSuccessful": returnData[0],
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_JoinRoom {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.JoinRoom(data.ProjectId, data.FlowUser.Username, client);
            let returnContent = {
                "MessageType": "JoinRoom",
                "WasSuccessful": true
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_DeleteRoom {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
}
class Command_CreateObject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowObject = new FlowObject_1.FlowObject(data.FlowObject);
            console.log(flowObject);
            let returnData = yield StateTracker_1.StateTracker.CreateObject(flowObject, data.ProjectId);
            let returnContent = {
                "MessageType": "CreateObject",
                "FlowObject": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_CheckinObject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var user = data.UserId;
            let object = yield StateTracker_1.StateTracker.ReadObject(data.ObjectId, data.ProjectId, client);
            console.log(object);
            let finalUpdate = yield StateTracker_1.StateTracker.UpdateObject(object[0], data.ProjectId, client, true, user);
            let returnData = yield StateTracker_1.StateTracker.CheckinObject(data.ProjectId, data.ObjectId, client, user);
            let returnContent = {
                "MessageType": "CheckinObject",
                "WasSuccessful": ((returnData[0]) && finalUpdate[0] != null) ? true : false,
                "ObjectID": data.ObjectId
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_CheckoutObject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var user = data.UserId;
            let returnData = yield StateTracker_1.StateTracker.CheckoutObject(data.ProjectId, data.ObjectId, client, user);
            let returnContent = {
                "MessageType": "CheckoutObject",
                "WasSuccessful": returnData[0],
                "ObjectID": data.ObjectId
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_DeleteObject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.DeleteObject(data.ObjectId, data.ProjectId, client);
            let returnContent = {
                "MessageType": "DeleteObject",
                "ObjectId": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_UpdateObject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowObject = new FlowObject_1.FlowObject(data.FlowObject);
            let returnData = yield StateTracker_1.StateTracker.UpdateObject(flowObject, data.ProjectId, client, false, data.UserId);
            let index = returnData[1].indexOf(client);
            returnData[1].splice(index, 1);
            let returnContent = {
                "MessageType": "UpdateObject",
                "FlowObject": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_ReadObject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.ReadObject(data.FlowObject.Id, data.ProjectId, client);
            let returnContent = {
                "MessageType": "ReadObject",
                "FlowObject": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_FinalizedUpdateObject {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var user = data.UserId;
            let flowObject = new FlowObject_1.FlowObject(data.FlowObject);
            let returnData = yield StateTracker_1.StateTracker.UpdateObject(flowObject, data.ProjectId, client, true, user);
            let index = returnData[1].indexOf(client);
            returnData[1].splice(index, 1);
            let returnContent = {
                "MessageType": "UpdateObject",
                "FlowObject": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_CreateAvatar {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowAvatar = new FlowAvatar_1.FlowAvatar(data.FlowAvatar);
            console.log(flowAvatar);
            let returnData = yield StateTracker_1.StateTracker.CreateAvatar(flowAvatar, data.ProjectId);
            let returnContent = {
                "MessageType": "CreateAvatar",
                "FlowAvatar": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
                "AvatarList": returnData[2]
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_DeleteAvatar {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.DeleteAvatar(data.AvatarId, data.ProjectId, client);
            let returnContent = {
                "MessageType": "DeleteAvatar",
                "AvatarId": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_UpdateAvatar {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowAvatar = new FlowAvatar_1.FlowAvatar(data.FlowAvatar);
            let returnData = yield StateTracker_1.StateTracker.UpdateAvatar(flowAvatar, data.ProjectId, client, false, data.user);
            let index = returnData[1].indexOf(client);
            returnData[1].splice(index, 1);
            let returnContent = {
                "MessageType": "UpdateAvatar",
                "FlowAvatar": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_FinalizedUpdateAvatar {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowAvatar = new FlowAvatar_1.FlowAvatar(data.FlowAvatar);
            let returnData = yield StateTracker_1.StateTracker.UpdateAvatar(flowAvatar, data.ProjectId, client, true);
            let index = returnData[1].indexOf(client);
            returnData[1].splice(index, 1);
            let returnContent = {
                "MessageType": "UpdateAvatar",
                "FlowAvatar": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_CreateBehaviour {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowBehaviour = new FlowBehaviour_1.FlowBehaviour(data.FlowBehaviour);
            flowBehaviour.ProjectId = data.ProjectId;
            let returnData = yield StateTracker_1.StateTracker.CreateBehaviour(flowBehaviour, data.ProjectId);
            yield StateTracker_1.StateTracker.LinkNewBehaviorToExistingBehaviors(data.ProjectId, flowBehaviour.Id, data.BehaviorsToLinkTo);
            let returnContent = {
                "MessageType": "CreateBehaviour",
                "BehaviorsToLinkTo": data.BehaviorsToLinkTo,
                "FlowBehaviour": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_DeleteBehaviour {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.DeleteBehaviour(data.ProjectId, data.BehaviourIds, client);
            let returnContent = {
                "MessageType": "DeleteBehaviour",
                "BehaviourId": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_UpdateBehaviour {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowBehaviour = new FlowBehaviour_1.FlowBehaviour(data.FlowBehaviour);
            let returnData = yield StateTracker_1.StateTracker.UpdateBehaviour(flowBehaviour, data.ProjectId, client, true);
            let returnContent = {
                "MessageType": "UpdateBehaviour",
                "FlowBehaviour": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_ReadBehaviour {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.ReadBehaviour(data.FlowBehaviour.Id, data.ProjectId, client);
            let returnContent = {
                "MessageType": "ReadBehaviour",
                "FlowBehaviour": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_StartPlayMode {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.TogglePlayMode(data.ProjectId, true);
            let returnContent = {
                "MessageType": "StartPlayMode",
                "WasSuccessful": returnData[0]
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_EndPlayMode {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.TogglePlayMode(data.ProjectId, false);
            let returnContent = {
                "MessageType": "EndPlayMode",
                "WasSuccessful": returnData[0]
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_CreateVSGraph {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowVSGraph = new FlowVSGraph_1.FlowVSGraph(data.FlowVSGraph);
            let returnedGraph = data.FlowVSGraph;
            console.log(flowVSGraph);
            let returnData = yield StateTracker_1.StateTracker.CreateVSGraph(flowVSGraph, data.ProjectId);
            returnedGraph.exposedParameters = JSON.stringify(returnedGraph.exposedParameters);
            returnedGraph.paramIdToObjId = JSON.stringify(returnedGraph.paramIdToObjId);
            let returnContent = {
                "MessageType": "CreateVSGraph",
                "FlowVSGraph": returnedGraph,
                "WasSuccessful": (returnData[0] == null) ? false : true
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_DeleteVSGraph {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.DeleteVSGraph(data.VSGraphId, data.ProjectId, client);
            let returnContent = {
                "MessageType": "DeleteVSGraph",
                "VSGraphId": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_UpdateVSGraph {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowVSGraph = new FlowVSGraph_1.FlowVSGraph(data.FlowVSGraph);
            let returnedGraph = data.FlowVSGraph;
            let returnData = yield StateTracker_1.StateTracker.UpdateVSGraph(flowVSGraph, data.ProjectId, client, false, data.user);
            let index = returnData[1].indexOf(client);
            returnData[1].splice(index, 1);
            returnedGraph.exposedParameters = JSON.stringify(returnedGraph.exposedParameters);
            returnedGraph.paramIdToObjId = JSON.stringify(returnedGraph.paramIdToObjId);
            let returnContent = {
                "MessageType": "UpdateVSGraph",
                "FlowVSGraph": returnedGraph,
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_ReadVSGraph {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.ReadVSGraph(data.FlowVSGraph.Id, data.ProjectId, client);
            let returnContent = {
                "MessageType": "ReadVSGraph",
                "FlowVSGraph": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_FinalizedUpdateVSGraph {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowVSGraph = new FlowVSGraph_1.FlowVSGraph(data.FlowVSGraph);
            let returnedGraph = data.FlowVSGraph;
            let returnData = yield StateTracker_1.StateTracker.UpdateVSGraph(flowVSGraph, data.ProjectId, client, true);
            let index = returnData[1].indexOf(client);
            returnData[1].splice(index, 1);
            returnedGraph.exposedParameters = JSON.stringify(returnedGraph.exposedParameters);
            returnedGraph.paramIdToObjId = JSON.stringify(returnedGraph.paramIdToObjId);
            let returnContent = {
                "MessageType": "FinalizedUpdateVSGraph",
                "FlowVSGraph": returnedGraph,
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_UpdateNodeView {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowNodeView = new FlowNodeView_1.FlowNodeView(data.FlowNodeView);
            let returnData = yield StateTracker_1.StateTracker.UpdateNodeView(flowNodeView, data.ProjectId, client, data.user);
            let index = returnData[1].indexOf(client);
            returnData[1].splice(index, 1);
            let returnContent = {
                "MessageType": "UpdateNodeView",
                "FlowNodeView": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_CheckinNodeView {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let nodeView = yield StateTracker_1.StateTracker.ReadNodeView(data.NodeGUID, data.ProjectId, client);
            console.log(nodeView);
            let update = yield StateTracker_1.StateTracker.UpdateNodeView(nodeView[0], data.ProjectId, client);
            let returnData = yield StateTracker_1.StateTracker.CheckinNodeView(data.ProjectId, data.NodeGUID, client);
            let returnContent = {
                "MessageType": "CheckinNodeView",
                "WasSuccessful": ((returnData[0]) && update[0] != null) ? true : false,
                "NodeGUID": data.NodeGUID
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_CheckoutNodeView {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let flowNodeView = new FlowNodeView_1.FlowNodeView(data.FlowNodeView);
            let returnData = yield StateTracker_1.StateTracker.CheckoutNodeView(data.ProjectId, flowNodeView, client);
            let returnContent = {
                "MessageType": "CheckoutNodeView",
                "WasSuccessful": returnData[0],
                "NodeGUID": data.NodeGUID
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class Command_RunVSGraph {
    ExecuteCommand(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnData = yield StateTracker_1.StateTracker.RunVSGraph(data.VSGraphId, data.ProjectId, client);
            let index = returnData[1].indexOf(client);
            returnData[1].splice(index, 1);
            let returnContent = {
                "MessageType": "RunVSGraph",
                "VSGraphId": returnData[0],
                "WasSuccessful": (returnData[0] == null) ? false : true,
            };
            let returnMessage = MessageBuilder_1.MessageBuilder.CreateMessage(returnContent, returnData[1]);
            return returnMessage;
        });
    }
}
class CommandContext {
    constructor() {
        this._CommandList = new Map();
    }
    CommandContext() {
    }
    ExecuteCommand(commandToExecute, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._CommandList.size == 0) {
                this._CommandList.set("CreateProject", new Command_CreateProject());
                this._CommandList.set("DeleteProject", new Command_DeleteProject());
                this._CommandList.set("OpenProject", new Command_OpenProject());
                this._CommandList.set("LeaveProject", new Command_LeaveProject());
                this._CommandList.set("ReadProject", new Command_ReadProject());
                this._CommandList.set("FetchProjects", new Command_FetchProjects());
                this._CommandList.set("CreateUser", new Command_CreateUser());
                this._CommandList.set("DeleteUser", new Command_DeleteUser());
                this._CommandList.set("LoginUser", new Command_LoginUser());
                this._CommandList.set("LogoutUser", new Command_LogoutUser());
                this._CommandList.set("ReadUser", new Command_ReadUser());
                this._CommandList.set("CreateRoom", new Command_CreateRoom());
                this._CommandList.set("DeleteRoom", new Command_DeleteRoom());
                this._CommandList.set("JoinRoom", new Command_JoinRoom());
                this._CommandList.set("CreateObject", new Command_CreateObject());
                this._CommandList.set("DeleteObject", new Command_DeleteObject());
                this._CommandList.set("UpdateObject", new Command_UpdateObject());
                this._CommandList.set("FinalizedUpdateObject", new Command_FinalizedUpdateObject());
                this._CommandList.set("ReadObject", new Command_ReadObject());
                this._CommandList.set("CheckinObject", new Command_CheckinObject());
                this._CommandList.set("CheckoutObject", new Command_CheckoutObject());
                this._CommandList.set("CreateAvatar", new Command_CreateAvatar());
                this._CommandList.set("DeleteAvatar", new Command_DeleteAvatar());
                this._CommandList.set("UpdateAvatar", new Command_UpdateAvatar());
                this._CommandList.set("FinalizedUpdateAvatar", new Command_FinalizedUpdateAvatar());
                this._CommandList.set("CreateVSGraph", new Command_CreateVSGraph());
                this._CommandList.set("DeleteVSGraph", new Command_DeleteVSGraph());
                this._CommandList.set("UpdateVSGraph", new Command_UpdateVSGraph());
                this._CommandList.set("FinalizedUpdateVSGraph", new Command_FinalizedUpdateVSGraph());
                this._CommandList.set("ReadVSGraph", new Command_ReadVSGraph());
                this._CommandList.set("UpdateNodeView", new Command_UpdateNodeView());
                this._CommandList.set("CheckinNodeView", new Command_CheckinNodeView());
                this._CommandList.set("CheckoutNodeView", new Command_CheckoutNodeView());
                this._CommandList.set("RunVSGraph", new Command_RunVSGraph());
                this._CommandList.set("CreateBehaviour", new Command_CreateBehaviour());
                this._CommandList.set("DeleteBehaviour", new Command_DeleteBehaviour());
                this._CommandList.set("ReadBehaviour", new Command_ReadBehaviour());
                this._CommandList.set("UpdateBehaviour", new Command_UpdateBehaviour());
                this._CommandList.set("StartPlayMode", new Command_StartPlayMode());
                this._CommandList.set("EndPlayMode", new Command_EndPlayMode());
            }
            console.log(commandToExecute);
            return (yield this._CommandList.get(commandToExecute).ExecuteCommand(data, client));
        });
    }
}
exports.CommandContext = CommandContext;
//# sourceMappingURL=CommandContext.js.map