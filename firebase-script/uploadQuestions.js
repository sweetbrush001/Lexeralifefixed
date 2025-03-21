import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyChjBTFM-wmcaPu64f4mn5Aiic8PE10G4Q",
    authDomain: "lexeralife-c3c97.firebaseapp.com",
    projectId: "lexeralife-c3c97",
    storageBucket: "lexeralife-c3c97.firebasestorage.app",
    messagingSenderId: "587825364063",
    appId: "1:587825364063:web:20ae04f283f835b274afea",
    measurementId: "G-P6E3V2918Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ageRangeQuestions = [
  {
    ageRange: "6-12 years",
    questions: [
      // Reading & Writing
      "Does your child read significantly below grade level?",
      "Does your child make frequent spelling errors even with common words?",
      "Does your child struggle with reading comprehension?",
      
      // Phonological Processing
      "Does your child struggle to sound out unfamiliar words?",
      "Does your child confuse similar-sounding words?",
      "Does your child struggle with spelling tests despite studying?",
      
      // Memory & Recall
      "Does your child have trouble remembering multiplication facts?",
      "Does your child forget what they've read by the end of a paragraph?",
      "Does your child have difficulty following written instructions?",
      
      // Directional & Spatial Awareness
      "Does your child frequently lose their place when reading?",
      "Does your child have difficulty copying from the board accurately?",
      
      // Concentration & Processing Speed
      "Does your child take much longer than peers to complete reading assignments?",
      "Does your child struggle to focus during silent reading?",
      "Does your child often need extra time to process verbal instructions?",
      "Does your child seem to understand material better when it's read aloud to them?"
    ]
  },
  {
    ageRange: "13-17 years",
    questions: [
      // Reading & Writing
      "Does your teen avoid reading aloud in class?",
      "Does your teen make persistent spelling errors in written work?",
      "Does your teen struggle with essay writing and organization?",
      
      // Phonological Processing
      "Does your teen struggle with pronunciation of unfamiliar words?",
      "Does your teen have trouble with foreign language classes?",
      "Does your teen spell words phonetically but incorrectly?",
      
      // Memory & Recall
      "Does your teen need to re-read text multiple times to understand it?",
      "Does your teen struggle to take effective notes in class?",
      "Does your teen have trouble remembering assignment instructions?",
      
      // Directional & Spatial Awareness
      "Does your teen have difficulty following written directions?",
      "Does your teen have trouble organizing written work spatially?",
      
      // Concentration & Processing Speed
      "Does your teen need significantly more time to complete reading assignments?",
      "Does your teen struggle to keep up with note-taking in class?",
      "Does your teen have difficulty maintaining focus during lectures?",
      "Does your teen process verbal information more slowly than peers?"
    ]
  },
  {
    ageRange: "18+ years (Adults)",
    questions: [
      // Reading & Writing
      "Do you avoid reading when possible or find it exhausting?",
      "Do you make persistent spelling errors despite spell-check?",
      "Do you need to re-read material multiple times to comprehend it?",
      
      // Phonological Processing
      "Do you struggle when attempting to learn new languages?",
      "Do you avoid public speaking or reading aloud?",
      "Do you find it difficult to take phone messages accurately?",
      
      // Memory & Recall
      "Do you have difficulty remembering sequences like PIN numbers?",
      "Do you need to use extensive notes or reminders for tasks?",
      "Do you have trouble following verbal directions with multiple steps?",
      
      // Directional & Spatial Awareness
      "Do you frequently get lost or disoriented in unfamiliar places?",
      "Do you confuse left and right or similar directional instructions?",
      
      // Concentration & Processing Speed
      "Do you need extra time to process written information compared to others?",
      "Do you find it difficult to focus during meetings or lectures?",
      "Do you prefer verbal instructions over written ones?",
      "Do you find it challenging to take notes while listening?"
    ]
  }
];

const uploadAgeRangeQuestions = async () => {
  try {
    // Upload each age range as a separate document
    for (const ageRangeObj of ageRangeQuestions) {
      console.log(`Uploading ${ageRangeObj.ageRange} questions...`);
      const docRef = await addDoc(collection(db, "ageRangeQuestions"), ageRangeObj);
      console.log(`Document written with ID: ${docRef.id} for age range: ${ageRangeObj.ageRange}`);
    }
    console.log("All age-specific questions uploaded successfully!");
  } catch (error) {
    console.error("Error uploading age-specific questions: ", error);
  }
};

// Call the function to upload the data
uploadAgeRangeQuestions();