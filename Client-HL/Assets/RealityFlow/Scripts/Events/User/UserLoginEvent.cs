﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

namespace Assets.RealityFlow.Scripts.Events
{
    [System.Serializable]
    public class UserLoginEvent : FlowEvent
    {
        public static int scmd = Commands.User.LOGIN;

        public FlowUser user;
        public FlowClient client;
        public List<FlowProject> projects;

        public UserLoginEvent()
        {
            command = scmd;
        }

        public void Send(string username, string password, int deviceType)
        {
            Config.DEVICE_TYPE = deviceType;

            user = new FlowUser(username, password);
            client = new FlowClient(deviceType);

            CommandProcessor.sendCommand(this);
        }

        public override void Send(WebSocket w)
        {
            base.Send(w, this);
        }

        public static string Receive()
        {
            UserLoginEvent log = JsonUtility.FromJson<UserLoginEvent>(FlowNetworkManager.reply);
            Config.userId = log.user._id;
            Config.deviceId = log.client._id;
            Config.projectList = log.projects;
            Config.loggedIn = true;

            return "Receiving user login update: " + FlowNetworkManager.reply;
        }
    }
}
