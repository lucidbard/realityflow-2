﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenuAttribute(fileName = "objectData", menuName ="FlowObject")]
public class ObjectData : ScriptableObject {

    public GameObject prefab;
    public Vector3 position;
    public Vector3 rotation;
    public Vector3 scale = new Vector3(1,1,1);
    public string objectName;
    public Mesh mesh;

}
