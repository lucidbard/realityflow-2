﻿using HoloToolkit.Unity.InputModule.Utilities.Interactions;
using HoloToolkit.Unity.UX;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

namespace Assets.RealityFlow.Scripts.Events
{
    [System.Serializable]
    public class ProjectFetchEvent : FlowEvent
    {
        public static int scmd = Commands.Project.OPEN;

        public FlowProject project;
        public List<FlowTObject> objs;
        public FlowClient client;

        public ProjectFetchEvent()
        {
            command = scmd;
        }

        public void Send()
        {
            project = new FlowProject(Config.projectId);
            client = new FlowClient(Config.deviceId);

            CommandProcessor.sendCommand(this);
        }

        public override void Send(WebSocket w)
        {
            base.Send(w, this);
        }

        public static string Receive()
        {
            ProjectFetchEvent log = new ProjectFetchEvent();
            JsonUtility.FromJsonOverwrite(FlowNetworkManager.reply, log);
            Config.objs = log.objs;

            foreach (FlowTObject obj in Config.objs)
            {

                FlowNetworkManager.log("creating object: " + obj.name);

                GameObject newObj = GameObject.CreatePrimitive(PrimitiveType.Cube);

                Mesh objMesh = newObj.GetComponent<MeshFilter>().mesh;
                objMesh.vertices = obj.vertices;
                objMesh.uv = obj.uv;
                objMesh.triangles = obj.triangles;
                objMesh.RecalculateBounds();
                objMesh.RecalculateNormals();
                newObj.transform.localPosition = new Vector3(obj.x, obj.y, obj.z);
                newObj.transform.localRotation = Quaternion.Euler(new Vector4(obj.q_x, obj.q_y, obj.q_z, obj.q_w));
                newObj.transform.localScale = new Vector3(obj.s_x, obj.s_y, obj.s_z);
                MonoBehaviour.Destroy(newObj.GetComponent<Collider>());
                newObj.AddComponent<BoxCollider>();
                newObj.name = obj.name;
                newObj.AddComponent(typeof(FlowObject));

                switch (Config.DEVICE_TYPE)
                {
                    case FlowClient.CLIENT_HOLOLENS:
                        newObj.AddComponent(typeof(TwoHandManipulatable));
                        newObj.AddComponent(typeof(BoundingBoxRig));

                        BoundingBox interactBox = (BoundingBox)Resources.Load("Prefabs/BoundingBoxBasic", typeof(BoundingBox));
                        newObj.GetComponent<TwoHandManipulatable>().BoundingBoxPrefab = interactBox;
                        newObj.GetComponent<BoundingBoxRig>().BoundingBoxPrefab = interactBox;

                        AppBar menuBar = (AppBar)Resources.Load("Prefabs/AppBar", typeof(AppBar));
                        newObj.GetComponent<BoundingBoxRig>().AppBarPrefab = menuBar;
                        break;
                }

                newObj.GetComponent<FlowObject>().selected = true; 
                Material mat = newObj.GetComponent<MeshRenderer>().material;
                mat.color = obj.color;
                newObj.GetComponent<FlowObject>().ft = new FlowTObject(newObj);
                newObj.GetComponent<FlowObject>().ft._id = obj._id;
                newObj.GetComponent<FlowObject>().ft.id = obj.id;
                newObj.GetComponent<FlowObject>().pastState = new FlowTObject();
                newObj.GetComponent<FlowObject>().pastState.Copy(newObj.GetComponent<FlowObject>().ft);

                newObj.GetComponent<FlowObject>().ft.flowObject = newObj.GetComponent<FlowObject>();
            }

            return "Receiving project open update: " + FlowNetworkManager.reply;
        }
    }
}
