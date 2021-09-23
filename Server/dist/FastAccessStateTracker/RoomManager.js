"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const Room_1 = require("./Room");
class RoomManager {
    static CreateRoom(projectID) {
        let newRoom = new Room_1.Room(projectID);
        this._RoomList.push(newRoom);
        this._RoomCount++;
        return projectID;
    }
    static FindRoom(roomCode) {
        return this._RoomList.find(element => element.GetRoomCode() == roomCode);
    }
    static DestroyRoom(roomCode) {
        let clients = RoomManager.getClients(roomCode);
        clients.forEach((clientList, userName, map) => clientList.forEach((client, index, arr) => {
            this.LeaveRoom(roomCode, userName, client);
            this.JoinRoom("noRoom", userName, client);
        }));
        let roomIndex = this._RoomList.findIndex(element => element.GetRoomCode() == roomCode);
        if (roomIndex > -1) {
            this._RoomList.splice(roomIndex, 1);
            this._RoomCount--;
        }
        return clients;
    }
    static JoinRoom(roomCode, user, clientId) {
        let roomToLogin = this.FindRoom(roomCode);
        roomToLogin.JoinRoom(user, clientId);
    }
    static LeaveRoom(roomCode, user, clientId) {
        let roomToLeave = this.FindRoom(roomCode);
        if (roomToLeave)
            roomToLeave.LeaveRoom(user, clientId);
    }
    static getClients(roomCode) {
        let room = this.FindRoom(roomCode);
        return room.getClients();
    }
    static updateObject(objectToUpdate, projectId, client) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.updateObject(objectToUpdate, client);
    }
    static updateBehaviour(BehaviourToUpdate, projectId, client) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.updateBehaviour(BehaviourToUpdate, client);
    }
    static AddObject(objectToCreate, projectId) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.AddObject(objectToCreate);
    }
    static DeleteObject(projectId, objectId, client) {
        let success = this._RoomList.find(element => element.GetRoomCode() == projectId).DeleteObject(objectId, client);
        return success;
    }
    static ReadObject(projectId, objectId) {
        return this._RoomList.find(element => element.GetRoomCode() == projectId).ReadObject(objectId);
    }
    static checkoutObject(projectId, objectId, client) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.checkoutObject(objectId, client);
    }
    static checkinObject(projectId, objectId, client) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.checkinObject(objectId, client);
    }
    static updateAvatar(AvatarToUpdate, projectId, client) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.updateAvatar(AvatarToUpdate, client);
    }
    static AddAvatar(AvatarToCreate, projectId) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.AddAvatar(AvatarToCreate);
    }
    static GetAvatarList(projectId) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.GetAvatarList();
    }
    static DeleteAvatar(projectId, AvatarId, client) {
        let success = this._RoomList.find(element => element.GetRoomCode() == projectId).DeleteAvatar(AvatarId, client);
        return success;
    }
    static updateVSGraph(vsGraphToUpdate, projectId, client) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.updateVSGraph(vsGraphToUpdate, client);
    }
    static AddVSGraph(vsGraphToCreate, projectId) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.AddVSGraph(vsGraphToCreate);
    }
    static DeleteVSGraph(projectId, vsGraphId, client) {
        let success = this._RoomList.find(element => element.GetRoomCode() == projectId).DeleteVSGraph(vsGraphId, client);
        return success;
    }
    static ReadVSGraph(projectId, vsGraphId) {
        return this._RoomList.find(element => element.GetRoomCode() == projectId).ReadVSGraph(vsGraphId);
    }
    static checkoutNodeView(projectId, flowNodeView, client) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.checkoutNodeView(flowNodeView, client);
    }
    static checkinNodeView(projectId, nodeGUID, client) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.checkinNodeView(nodeGUID, client);
    }
    static ReadNodeView(projectId, nodeGUID) {
        return this._RoomList.find(element => element.GetRoomCode() == projectId).ReadNodeView(nodeGUID);
    }
    static updateNodeView(nodeViewToUpdate, projectId, client) {
        let room = this._RoomList.find(element => element.GetRoomCode() == projectId);
        return room.updateNodeView(nodeViewToUpdate, client);
    }
}
exports.RoomManager = RoomManager;
RoomManager._RoomList = [];
RoomManager._RoomCount = 0;
//# sourceMappingURL=RoomManager.js.map