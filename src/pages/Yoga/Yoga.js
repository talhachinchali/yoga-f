import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect } from 'react'
import backend from '@tensorflow/tfjs-backend-webgl'
import Webcam from 'react-webcam'
import { count } from '../../utils/music'; 
 
import Instructions from '../../components/Instrctions/Instructions';

import './Yoga.css'
 
import DropDown from '../../components/DropDown/DropDown';
import { poseImages } from '../../utils/pose_images';
import { POINTS, keypointConnections } from '../../utils/data';
import { drawPoint, drawSegment } from '../../utils/helper'



let skeletonColor = 'rgb(255,255,255)'
let poseList = [
   'Tree', 'Warrior', 
  'Shoulderstand', 'Traingle'
]
const filteredPoseList = ['Cobra', 'Chair', 'Dog'];

let interval

// flag variable is used to help capture the time when AI just detect 
// the pose as correct(probability more than threshold)
let flag = false


function Yoga() {
  const [age, setAge] = useState(0);
  const [weight, setWeight] = useState(0);
  const [gender, setGender] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [blowForm, setBlowForm] = useState(true);
  const [poseerror,setPoseError]=useState("");
  const [poseerror2,setPoseError2]=useState("");
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)


  const [startingTime, setStartingTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [poseTime, setPoseTime] = useState(0)
  const [bestPerform, setBestPerform] = useState(0)
  const [currentPose, setCurrentPose] = useState(0)
  const [isStartPose, setIsStartPose] = useState(false)

  
  useEffect(() => {
    const timeDiff = (currentTime - startingTime)/1000
    if(flag) {
      setPoseTime(timeDiff)
    }
    if((currentTime - startingTime)/1000 > bestPerform) {
      setBestPerform(timeDiff)
    }
  }, [currentTime])


  useEffect(() => {
    setCurrentTime(0)
    setPoseTime(0)
    setBestPerform(0)
  }, [currentPose])

  const CLASS_NO = {
    Chair: 0,
    Cobra: 1,
    Dog: 2,
    No_Pose: 3,
    Shoulderstand: 4,
    Traingle: 5,
    Tree: 6,
    Warrior: 7,
  }

  function get_center_point(landmarks, left_bodypart, right_bodypart) {
    let left = tf.gather(landmarks, left_bodypart, 1)
    let right = tf.gather(landmarks, right_bodypart, 1)
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5))
    return center
    
  }

  function get_pose_size(landmarks, torso_size_multiplier=2.5) {
    let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    let shoulders_center = get_center_point(landmarks,POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER)
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center))
    let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center_new = tf.expandDims(pose_center_new, 1)

    pose_center_new = tf.broadcastTo(pose_center_new,
        [1, 17, 2]
      )
      // return: shape(17,2)
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0)
    let max_dist = tf.max(tf.norm(d,'euclidean', 0))

    // normalize scale
    let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist)
    return pose_size
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center = tf.expandDims(pose_center, 1)
    pose_center = tf.broadcastTo(pose_center, 
        [1, 17, 2]
      )
    landmarks = tf.sub(landmarks, pose_center)

    let pose_size = get_pose_size(landmarks)
    landmarks = tf.div(landmarks, pose_size)
    return landmarks
  }

  function landmarks_to_embedding(landmarks) {
    // normalize landmarks 2D
    landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0))
    let embedding = tf.reshape(landmarks, [1,34])
    return embedding
  }

  const runMovenet = async () => {
    const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    
    const poseClassifier = await tf.loadLayersModel('https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json')
    const countAudio = new Audio(count)
    countAudio.loop = true
    interval = setInterval(() => { 
        detectPose(detector, poseClassifier, countAudio)
    }, 100)
  }

  const detectPose = async (detector, poseClassifier, countAudio) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      let notDetected = 0;
      const video = webcamRef.current.video;
      const pose = await detector.estimatePoses(video);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      try {
        const keypoints = pose[0].keypoints;
        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (
              !(keypoint.name === "left_eye" || keypoint.name === "right_eye")
            ) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, "rgb(255,255,255)");
              let connections = keypointConnections[keypoint.name];
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase();
                  drawSegment(
                    ctx,
                    [keypoint.x, keypoint.y],
                    [
                      keypoints[POINTS[conName]].x,
                      keypoints[POINTS[conName]].y,
                    ],
                    skeletonColor
                  );
                });
              } catch (err) {}
            }
          } else {
            notDetected += 1;
          }
          return [keypoint.x, keypoint.y];
        });
        if (notDetected > 4) {
          skeletonColor = "rgb(255,255,255)";
          return;
        }
        const processedInput = landmarks_to_embedding(input);
        const classification = poseClassifier.predict(processedInput);
  
        classification.array().then((data) => {
          const classNo = CLASS_NO[currentPose];
          console.log(data[0][classNo]);
          if (data[0][classNo] > 0.97) {
            if (!flag) {
              countAudio.play();
              setStartingTime(new Date(Date()).getTime());
              flag = true;
            }
            setCurrentTime(new Date(Date()).getTime());
            skeletonColor = "rgb(0,255,0)";
            setPoseError( data[0][classNo] * 100); // set pose error percentage
            setPoseError2( 100-data[0][classNo] * 100); // set pose error percentage
          } else {
            flag = false;
            skeletonColor = "rgb(255,255,255)";
            countAudio.pause();
            countAudio.currentTime = 0;
            setPoseError( data[0][classNo] * 100); // set pose error percentage
            setPoseError2( 100-data[0][classNo] * 100); // set pose error percentage
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
  

  function startYoga(){
    setIsStartPose(true) 
    runMovenet()
  } 

  function stopPose() {
    setIsStartPose(false)
    clearInterval(interval)
  }

    

  if(isStartPose) {
    return (
      <div className="yoga-container">
        <div className="performance-container">
            <div className="pose-performance">
              <h4>Pose Time: {poseTime} s</h4>
            </div>
            <div className="pose-performance">
              <h4>Best: {bestPerform} s</h4>
            </div>
            <div className="pose-performance">
              <h4>correctness: {poseerror} s</h4>
            </div>
            <div className="pose-performance">
              <h4>error: {poseerror2} s</h4>
            </div>
          </div>
        <div>
          
          <Webcam 
          width='640px'
          height='480px'
          id="webcam"
          ref={webcamRef}
          style={{
            position: 'absolute',
            left: 120,
            top: 100,
            padding: '0px',
          }}
        />
          <canvas
            ref={canvasRef}
            id="my-canvas"
            width='640px'
            height='480px'
            style={{
              position: 'absolute',
              left: 120,
              top: 100,
              zIndex: 1
            }}
          >
          </canvas>
        <div>
            <img 
              src={poseImages[currentPose]}
              className="pose-img"
            />
          </div>
         
        </div>
        <button
          onClick={stopPose}
          className="secondary-btn"    
        >Stop Pose</button>
      </div>
    )
  }

  /*return (
    <div
      className="yoga-container"
    >
      <DropDown
        poseList={poseList}
        currentPose={currentPose}
        setCurrentPose={setCurrentPose}
      />
      <Instructions
          currentPose={currentPose}
        />
      <button
          onClick={startYoga}
          className="secondary-btn"    
        >Start Pose</button>
    </div>
  )
}*/

//function AgeInput() {
 
 
  function handleInputChange(event) {
    setAge(Number(event.target.value));
  }

  function handleWeightInputChange(event) {
    setWeight(Number(event.target.value));
  }

  const handleGenderInputChange = (event) => {
    setGender(event.target.value);
  }


  function handleSubmit(event) {
    event.preventDefault();
    if (age >= 18 && weight>=50) {
      setShowForm(false);
      setBlowForm(false);
      setCurrentPose('Tree')
      
    } else {
     
      setShowForm(true);
      setBlowForm(false);
      setCurrentPose('Cobra')
    }
  }
  
  if (showForm && blowForm) {
    return (
      <body className='agebody'>
        <div class="form-container">
          <form onSubmit={handleSubmit} style={{width: '50%'}}>
            <div className="yoga-container22">
              <h1 style={{textAlign: 'center', textShadow: '4px 4px 4px #000000'}}>Enter your Age:</h1>
              <div className="form">
                <input type="number" value={age} onChange={handleInputChange} style={{ fontSize: '50px',boxShadow: '2px 8px 8px #000000' }} className="form__input" autocomplete="off" placeholder="   "/>
              </div>
              <h1 style={{textAlign: 'center', textShadow: '4px 4px 4px #000000'}}>Enter your weight:</h1>
              <div className="form">
                <input type="number" value={weight} onChange={handleWeightInputChange} style={{ fontSize: '50px',boxShadow: '2px 8px 8px #000000' }} className="form__input" autocomplete="off" placeholder="   "/>
              </div>

              <h1 style={{textAlign: 'center', textShadow: '4px 4px 4px #000000'}}>Select your gender:</h1>
                <div className="form">
                    <select value={gender} onChange={handleGenderInputChange} style={{ fontSize: '50px',boxShadow: '2px 8px 8px #000000' }} className="form__input" autoComplete='off' placeholder=' '>
                       <option value="male">Male</option>
                       <option value="female">Female</option>
                       <option value="other">other</option>
                      </select>
                </div>
            </div>
    <div className='button-container'>
    <button type="submit" style={{boxShadow: '4px 4px 4px #000000'}}>Submit</button>
    </div>
  </form>
</div>
</body>
    );
  } else if(showForm==false && blowForm==false){
    return (
      <div className="yoga-container">
        <DropDown
          poseList={poseList}
          currentPose={currentPose}
          setCurrentPose={setCurrentPose}
        />
        <Instructions currentPose={currentPose} />
        <button onClick={startYoga} className="secondary-btn">
          Start Pose
        </button>
      </div>
    );
  }
  else{return(
    <div className="yoga-container">
    <DropDown
      poseList={filteredPoseList}
      currentPose={currentPose}
      setCurrentPose={setCurrentPose}
    />
    <Instructions currentPose={currentPose} />
    <button onClick={startYoga} className="secondary-btn">
      Start Pose
    </button>
  </div>
  );}
//}


/*return (
  <div>
    {AgeInput()}
  </div>
);*/

}


export default Yoga