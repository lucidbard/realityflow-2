﻿using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;
using UnityEngine.UI;
using System.Runtime.InteropServices;

/// <summary>
/// Establishes a connection to the Flow server through websocket connections and handles high-level communication
/// </summary>
public class FlowNetworkManager : MonoBehaviour
{
    public bool LocalServer;

    //string LOCAL_SERVER = "ws://echo.websocket.org";
    string LOCAL_SERVER = "ws://localhost:8999";
    string LAN_SERVER = "ws://192.168.1.246:8082";
    string REMOTE_SERVER = "ws://plato.mrl.ai:8999";

    float selectionSize = .65f;
    public bool music;
    private int ignoreLayer;
    private int selectionLayer;
    public GameObject mainGameCamera;
    public GameObject eventSystem;
    public static String reply;
    public Text connectionStatus;
    public static Canvas mainCanvas;
    public static FlowNetworkManager instance;
    private static bool connected = false;
    public static String username;
    public static String password;
    public static int uid = 3;
    public static string identity_value = "-1";
    public string test;
    public GameObject parentObject;
    IEnumerator coroutine;
    public static bool connection_established = false;

    bool loggedIn = false;

    public static bool isMaster = false;

    public const int CLIENT_EDITOR = 0;
    public const int CLIENT_WEB = 1;
    public const int CLIENT_RIPPLE = 2;
    public const int CLIENT_HOLOLENS = 3;
    public const int CLIENT_MAGICLEAP = 4;

    private const int ERROR_NO_CLIENT_FOUND = 0;

#if UNITY_EDITOR || UNITY_WSA || UNITY_ANDROID || UNITY_IOS || (!UNITY_EDITOR && !UNITY_WSA && !UNITY_ANDROID && !UNITY_IOS)

    public static int GetUID()
    {
        return 3;
    }
    public static int GetUserID()
    {
        return uid;
    }

    public static void SendString(string s)
    {
        Debug.Log(s);
    }

    public static string GetUsername()
    {
        return username;
    }
#endif

    WebSocket w;
    int thirdFrame = 0;

    [System.Serializable]
    public struct FlowUser
    {
        public String _id;
        public String username;
        public String active_project;
        public List<FlowClient> clients;
        public FlowState active_State;
    }


    public int onFrame = 3;
    FlowTransform newVal;
    bool selection = false;
    FlowTransform cur_transform;
    int count = 0;

    public static void ObjectCmd(FlowEvent jsonCmd)
    {
        Debug.Log("[unity] Received object JSON command:");
        Debug.Log(jsonCmd.ToString());
    }

    public void TriggerEvent()
    {
        Debug.Log("[unity] Event Triggered!");
    }


#if !UNITY_EDITOR && UNITY_WEBGL

    [DllImport("__Internal")]
    public static extern string GetUsername();

    [DllImport("__Internal")]
    public static extern void SendTransform(float x, float y, float z);
    
    [DllImport("__Internal")]
    public static extern void SendString(string s);
#endif

#if UNITY_EDITOR
    public static int clientType = 0;
    private IEnumerator onLoggedInCoroutine;
#elif UNITY_WEBGL && !UNITY_EDITOR
    public static int clientType = CLIENT_WEB;
#elif UNITY_IOS || UNITY_ANDROID && !UNITY_EDITOR
    public static int clientType = CLIENT_RIPPLE;
#elif UNITY_WSA && !UNITY_EDITOR
    public static int clientType = CLIENT_HOLOLENS;
#elif (!UNITY_WSA && !UNITY_EDITOR && !UNITY_IOS && !UNITY_WEBGL && !UNITY_ANDROID)
    public static int clientType = CLIENT_MAGICLEAP;
#endif

    public void connectDisconnect()
    {
        if (connected)
        {
            Debug.Log("[unity] Disconnecting");
            w.Close();
            connectionStatus.text = "Connect";
            connected = false;
        }
        else
        {
            Debug.Log("[unity] Connecting");
            CommandProcessor.sendCommand(Commands.LOGIN, uid.ToString());
            DoOnMainThread.ExecuteOnMainThread.Enqueue(() =>
            {
                StartCoroutine(ConnectWebsocket());
            });
            connectionStatus.text = "Disconnect";
        }
    }

    void WPLogin()
    {
        //login.ShowLoginScreen();
        //login.login_username.text = username;
        //login.login_password.text = password;
        //login.DoLogin();
    }

    IEnumerator ReconnectWebsocket()
    {
        yield return new WaitForSeconds(5);
        yield return StartCoroutine(w.Connect());
        Debug.Log("Connected Websocket!");
    }

    void Awake()
    {
        instance = this;
        Debug.Log("Setting main camera " +  clientType);
            FlowCameras.mainCamera = mainGameCamera.GetComponent<Camera>();
        mainCanvas = GameObject.Find("DebugCanvas").GetComponent<Canvas>();
        /* if (DebugPanel.instance.forceHolo == true)
        {
            clientType = CLIENT_HOLOLENS;
        }
        if (DebugPanel.instance.forceWeb == true)
            clientType = CLIENT_WEB;
        if (clientType == CLIENT_HOLOLENS)
        {
            mainGameCamera.transform.position = new Vector3(0, 0.25f, -0.7f);
            mainGameCamera.transform.rotation = Quaternion.identity;
        }*/
    }

    bool AR_Enabled = true;
    GameObject arButton;

    public void toggleAR()
    {
        if (arButton == null)
            arButton = GameObject.Find("AR Input");
        ColorBlock cb = arButton.GetComponent<Button>().colors;
        AR_Enabled = !AR_Enabled;
        if (AR_Enabled)
        {
            cb.normalColor = new Color(0, .86f, 0);
            cb.highlightedColor = new Color(0, 1, 0);
        }
        else
        {
            cb.normalColor = Color.white;
            cb.highlightedColor = Color.white;
        }
        arButton.GetComponent<Button>().colors = cb;
    }



    void Start()
    {

#if !UNITY_EDITOR && UNITY_WEBGL
        WebGLInput.captureAllKeyboardInput = false;
#endif

        username = GetUsername();
        uid = GetUID();

        Application.runInBackground = true;
        if (clientType == CLIENT_EDITOR)
        {
            // Enable Vuforia
            mainGameCamera.SetActive(true);
  //          VectorLine.SetCamera3D(FlowCameras.mainCamera);

//            if (login != null)
//                login.fetch_account_id = true;
//            WULogin.onLoggedIn += OnLoggedIn;
        }
        else if (clientType == CLIENT_WEB)
        {
            FlowCameras.mainCamera = mainGameCamera.GetComponent<Camera>();
            //login.gameObject.SetActive(false);
            string loginName = GetUsername();
        }
        else if (clientType == CLIENT_HOLOLENS)
        {
            Debug.Log("HOLOLENS!");
            mainGameCamera.SetActive(true);
            //mainGameCamera.GetComponent<Camera>().enabled = false;
            //mainGameCamera.tag = "MainCamera";

            //login.gameObject.SetActive(false);
            string loginName = GetUsername();
#if UNITY_WSA
            eventSystem.AddComponent<UnityEngine.EventSystems.HoloLensInputModule>();
#endif
        }
        else if (clientType == CLIENT_MAGICLEAP)
        {
            Debug.Log("MAGIC LEAP!");
            mainGameCamera.SetActive(true);
            string loginName = GetUsername();
        }

        if (LocalServer)
        {
            if ((clientType != CLIENT_RIPPLE && clientType != CLIENT_HOLOLENS) || (DebugPanel.instance.forceHolo))
            {
                w = new WebSocket(new Uri(LOCAL_SERVER));
                Debug.Log("[unity] Connecting to " + LOCAL_SERVER);
            }
            else
            {
                Debug.Log("[unity] Connecting to " + LAN_SERVER);
                w = new WebSocket(new Uri(LAN_SERVER));
            }
        }
        else
        {
            Debug.Log("[unity] Connecting Websocket " + REMOTE_SERVER);
            w = new WebSocket(new Uri(REMOTE_SERVER));
        }
        //w.Connect();
        //ConnectWebsocket();
        Debug.Log("Going to Websocket Connection...");
        DoOnMainThread.ExecuteOnMainThread.Enqueue(() =>
        {
            StartCoroutine(ConnectWebsocket());
        });
        Debug.Log("Sent Connection Request");
    }

    IEnumerator ConnectWebsocket()
    {
        Debug.Log("Connecting...");
        yield return StartCoroutine(w.Connect());
        Debug.Log("Connecting...2");
        while (w.error == "Closed")
        {
            yield return StartCoroutine(ReconnectWebsocket());
            Debug.Log("Closed connection");
        }
        
        connected = true;
        Debug.Log("[unity] Connected!");
        switch (clientType)
        {
            case CLIENT_EDITOR:
                OnLoggedIn();
                //WPLogin();
                break;
            case CLIENT_WEB:
                OnWebLoggedIn();
                break;
            case CLIENT_HOLOLENS:
                OnLoggedIn();
                break;
            case CLIENT_MAGICLEAP:
                OnLoggedIn();
                break;
        }
        Debug.Log("CONNECTED WEBSOCKET");

        //NoteEnum note = NoteEnum.C;
	    //AccidentalEnum accidental = AccidentalEnum.None;
	    //OctaveEnum octave = OctaveEnum.Octave4;
	    //ChannelEnum channel = ChannelEnum.C0;

	    //int value = 80;
        //MidiOut.NoteOn (note, accidental, octave, value, channel);	

        //mainCanvas.renderMode = RenderMode.WorldSpace;
        while (true)
        {
            reply = w.RecvString();
            if (reply != null && reply != "Null")
            {
                Debug.Log("Processing Command");
                FlowEvent incoming = JsonUtility.FromJson<FlowEvent>(reply);
                if (incoming.cmd >= Commands.Project.MIN && incoming.cmd <= Commands.Project.MAX)
                {
                    CommandProcessor.processProjectCommand(JsonUtility.FromJson<FlowProjectCommand>(reply));
                }
                else
                {
                    CommandProcessor.processCommand(incoming);
                }
            }
            if (w.error != null)
            {
                Debug.Log("[unity] Error: " + w.error);
                connected = false;

                yield return new WaitForSeconds(5);
#if !UNITY_WSA || UNITY_EDITOR
                DoOnMainThread.ExecuteOnMainThread.Enqueue(() =>
                {
                    StartCoroutine(ConnectWebsocket());
                });
                Debug.Log("Connect connection");
                CommandProcessor.sendCommand(Commands.LOGIN, uid.ToString());
                loggedIn = false;
#endif
            }
            yield return 0;
        }
    }

    void OnWebLoggedIn()
    {
        Debug.Log("[unity] Logged in");
        DebugPanel.instance.clientIdentityValue.GetComponent<Text>().text = uid + " " + GetUsername();
        loggedIn = true;
        CommandProcessor.sendCommand(Commands.LOGIN, uid.ToString());
        //DoOnMainThread.ExecuteOnMainThread.Enqueue(() => { StartCoroutine(ConnectWebsocket()); });
    }

    void OnLoggedIn()
    {
        Debug.Log("LoggedIn");
        //DebugPanel.instance.clientIdentityValue.GetComponent<Text>().text = uid + " " + GetUsername();
        loggedIn = true;
        CommandProcessor.sendCommand(Commands.LOGIN, uid.ToString());
    }

    /// <summary>
    /// Update is called every frame, if the MonoBehaviour is enabled.
    /// </summary>
    void Update()
    {

        // Start with delete key.
        if (Input.GetKeyDown(KeyCode.Delete))
        {
            Debug.Log("Deleting!!!");
            // Send Delete Commands
        }
        if (CommandProcessor.cmdBuffer.Count > 0 && connected)
        {
            Debug.Log("Sending command!");
            foreach (FlowEvent cmd in CommandProcessor.cmdBuffer)
            {
                Debug.Log(JsonUtility.ToJson(cmd));
                cmd.Send(w);
            }
            CommandProcessor.cmdBuffer.Clear();
        }
    }

    public static int primitiveID = 0;

    public void CreateText()
    {
        FlowEvent createCubeEvent = new FlowEvent();
        createCubeEvent.cmd = Commands.Droplet.types.TEXT;
        createCubeEvent.value = new FlowPayload(Commands.Droplet.types.TEXT.ToString());
        //        CommandProcessor.EditorCommandProcessor(createCubeEvent);
        CommandProcessor.sendCommand(createCubeEvent);
    }

    public void SetColor()
    {
        /*
        Droplet drop = SelectionManager.GetSelection();
        if (drop != null)
            Debug.Log(drop.gameObject.name);
        TransformCommand setColorModifierEvent = new TransformCommand();
        setColorModifierEvent.cmd = Commands.Modifier.types.COLOR;
        Color newColor = Color.white;
        setColorModifierEvent.transform = new FlowTransform(newColor.r, newColor.g, newColor.b, newColor.a);
        setColorModifierEvent.transform.id = drop._id;
        CommandProcessor.EditorCommandProcessor(setColorModifierEvent);
        */
    }

    public void AddScale()
    {
        /*
        Droplet drop = SelectionManager.GetSelection();
        if (drop != null)
            Debug.Log(drop.gameObject.name);
        TransformCommand scaleObjectEvent = new TransformCommand();
        scaleObjectEvent.cmd = Commands.Modifier.types.SCALE;
        scaleObjectEvent.transform = new FlowTransform(0.22225f, 0.127f, 1.49225f);
        scaleObjectEvent.transform.id = drop._id;
        CommandProcessor.EditorCommandProcessor(scaleObjectEvent);
        */
    }

    public int ARRAY_SIZE = 5;
    public Vector3 ARRAY_OFFSET = new Vector3(.4f, .4f, .4f);


    public void MakeArray()
    {
        /*
        Droplet drop = SelectionManager.GetSelection();
        if (drop != null)
            Debug.Log(drop.gameObject.name);
        float off_x = 0.15f;
        TransformCommand createArrayEvent = new TransformCommand();
        createArrayEvent.cmd = Commands.Modifier.types.ARRAY;
        createArrayEvent.transform = new FlowTransform(off_x, 0, 0);
        createArrayEvent.transform.id = drop._id;
        int id = CommandProcessor.EditorCommandProcessor(createArrayEvent);
        */
    }

    public void ResetPlayerPrefs()
    {
        PlayerPrefs.DeleteAll();
        identity_value = "-1";
        connection_established = false;
        w.Close();
    }

    public void OnApplicationQuit()
    {
        FlowEvent closeEvent = new FlowEvent();
        closeEvent.cmd = -1;
        CommandProcessor.sendCommand(closeEvent);
        Debug.Log("Closing!!");
        if(w != null && w.connected )
        w.Close();
    }

#if !UNITY_EDITOR && UNITY_WEBGL
    [DllImport("__Internal")]
    private static extern int GetUID();
#endif

}