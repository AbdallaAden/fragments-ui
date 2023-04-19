// src/app.js

import { Auth, getUser } from "./auth";
import { getUserFragments, postUserFragments, getFragmentById, getFragmentByIdInfo, deleteFragmentById,updateUserFragments } from "./api";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");

  const fragType = document.getElementById("fragmentType");
  const textFragmentBtn = document.querySelector("#textFragBtn");
  const textFrag = document.querySelector("#textFrag");
  const getFragsBtn = document.querySelector("#getFrags");

  const FragmentByIdBtn = document.querySelector("#getFragById");
  const FragId = document.querySelector("#fragId");

  const out1 = document.getElementById("#output1");
  const displayD = document.getElementById("displayFrag")
  //const imgDis = document.querySelector('img')
  const getImg =document.getElementById("image")
  const imageFragmentBtn = document.querySelector("#imgFragBtn");

  //var gotID;

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Do an authenticated request to the fragments API server and log the result
  //getUserFragments(user)
  textFragmentBtn.onclick = () => {
    console.log("frag type " + fragType.value);
    postUserFragments(user, textFrag.value, fragType.value);
  };
  imageFragmentBtn.onclick = () => {
    const imgType= getImg.value.split('.').pop()
    if (imgType!== 'jpg' && imgType!== 'jpeg' && imgType!== 'png' && imgType!== 'webp' && imgType!== 'gif')
    alert('invalid image type')
    var newType = 'image/'+getImg.value.split('.').pop()
    if (newType=='image/jpg') newType = 'image/jpeg'
    console.log("frag type " + newType);
    postUserFragments(user, getImg.files[0], newType);
  };

  getFragsBtn.onclick = async () => {
    gotID = await getUserFragments(user,0);
    displayMultipleFragments(gotID);
    //document.getElementById("output1").innerHTML = JSON.stringify(gotID,null, "\t");
  };

  FragmentByIdBtn.onclick = async () => {
    if (!FragId || FragId.value == "")
      alert("Fragment ID section can't be empty");
    else {
      gotID = await getFragmentByIdInfo(user, FragId.value);
      console.log('calling single frag' + gotID);
      displaySingleFragment(gotID);
      //document.getElementById("output1").innerHTML = JSON.stringify(gotID.data.fragment,null, "\t");
    }
  };

// Display a single fragment
function displaySingleFragment(fragment) {
  console.log('single');
  const table = document.createElement("table");
  table.border = "1";
  table.style.borderCollapse = "collapse";
  table.style.background = "darkblue";
  displayD.textContent = "";
  
 
  for (const key in fragment.data.fragment) {
    if (Object.hasOwnProperty.call(fragment.data.fragment, key)) {
      const row = table.insertRow();
      const keyCell = row.insertCell();
      const valueCell = row.insertCell();
      keyCell.innerText = key;
      keyCell.style.fontWeight = "bold";
      keyCell.style.padding = "8px";
      valueCell.innerText = fragment.data.fragment[key];
      row.classList.add("fragment-row");
      if (key === 'ownerId') {
        const userbuttonCell = row.insertCell();
        const userbutton = document.createElement('button');
        userbutton.innerText = 'Find All by user';
        userbutton.addEventListener('click', async()  => {
          const gotID = await getUserFragments(user,0)
          console.log(gotID)
          displayMultipleFragments(gotID);
          console.log('Edit button clicked for userId', fragment.data.fragment.ownerId+' '+gotID);
        });
        userbuttonCell.appendChild(userbutton);
      }
      if (key === 'id') {
        const idbuttonCell = row.insertCell();
        const idbutton = document.createElement('button');
        idbutton.innerText = 'Display Data';
        idbutton.addEventListener('click', async()  => {
          const disData = await getFragmentById(user,fragment.data.fragment.id)
          console.log('display data returned: ',disData.data)
          if(fragment.data.fragment.type.startsWith('image/')){
            const img = URL.createObjectURL(disData.data)
            console.log('image returned: ',img)
            const imgDis = document.createElement('img');
            imgDis.src = img;
            imgDis.alt = 'Image Fragment';
            displayD.innerHTML = '';
            displayD.appendChild(imgDis);
          }
          else{
          console.log('Displaying Data', fragment.data.fragment.ownerId+' '+disData.data);
          if(fragment.data.fragment.type==='application/json'){
            let Jdata= JSON.stringify(disData.data, undefined,2)
            displayD.textContent = Jdata;
          }
          else
          displayD.textContent = disData.data;
          }
        });
        idbuttonCell.appendChild(idbutton);
      }
      if (key === 'type' && fragment.data.fragment.type === 'text/markdown') {
        const typebuttonCell = row.insertCell();
        const typebutton = document.createElement('button');
        typebutton.innerText = 'Convert type';
        typebutton.addEventListener('click', async()  => {
          const convertedData = await getFragmentById(user,fragment.data.fragment.id, 'html')
          console.log('Converted data from app.js: ',convertedData)
          displayD.textContent = convertedData.data;
        });
        typebuttonCell.appendChild(typebutton);
      }
      if (key === 'updated' && !fragment.data.fragment.type.startsWith('image/')) {
        const updatedbuttonCell = row.insertCell();
        const updatedbutton = document.createElement('button');
        updatedbutton.innerText = 'Update Fragment';
        updatedbutton.addEventListener('click', async()  => {
          var e = document.createElement('input');
          e.type='text';
          e.name = 'added'+this.rel;
          this.rel = parseFloat(this.rel)+1;
          displayD.appendChild(e);
          const subUpButton= document.createElement('button')
          subUpButton.innerText = 'Click to update';
          displayD.appendChild(subUpButton)
          subUpButton.addEventListener('click', async()  => {
            console.log('e value: ', e.value)
           const updatedData= await updateUserFragments(user,fragment.data.fragment.id,e.value,fragment.data.fragment.type)
            console.log('Updated data from app.js: ',updatedData)
            displayD.textContent = updatedData.data;
          })
          /*const gotID = await getUserFragments(user,0)
          console.log(gotID)
          displayMultipleFragments(gotID);
          console.log('Update Fragment', fragment.data.fragment.ownerId+' '+gotID);*/
        });
        updatedbuttonCell.appendChild(updatedbutton);
      }
      if (key === 'size') {
        const deletebuttonCell = row.insertCell();
        const deletebutton = document.createElement('button');
        deletebutton.innerText = 'Delete Fragment';
        deletebutton.addEventListener('click', async()  => {
          console.log('from the delete button ====', fragment.data.fragment.id)
          const localId= fragment.data.fragment.id
          await deleteFragmentById(user,fragment.data.fragment.id)
          alert('deleted: '+localId)
          gotID = await getUserFragments(user,0);
          displayMultipleFragments(gotID);
        });
        deletebuttonCell.appendChild(deletebutton);
      }
    }
  }

  // Display table
  document.getElementById("output1").innerHTML = "";
  document.getElementById("output1").appendChild(table);
}


  

  function displayMultipleFragments(fragments) {
    console.log(JSON.stringify({fragments}) + ' display multiple')
    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.background = "darkblue";
    displayD.innerHTML = "";
  
    // Create header row
    const headerRow = table.insertRow();
    const headerCell = headerRow.insertCell();
    headerCell.innerText = "All Fragment Id's";
    headerCell.style.fontWeight = "bold";
    headerCell.style.padding = "8px";
  
    // Create data rows
    fragments.fragments.forEach((fragment) => {
      const dataRow = table.insertRow();
      const dataCell = dataRow.insertCell();
      const button = document.createElement("button");
      button.classList.add("view-btn");
      button.innerText = 'Show full fragment';
      button.onclick = async () => {
        console.log(fragment)
        const singleFragment = await getFragmentByIdInfo(user, fragment);
        console.log(singleFragment)
        displaySingleFragment(singleFragment);
      };
      //console.log(fragment)
      dataCell.innerText = fragment;
      dataCell.style.padding = "8px";
      dataCell.appendChild(button);
    });
  
    // Create an empty row after the 'size' row
    const emptyRow = table.insertRow();
    const emptyCell = emptyRow.insertCell();
    emptyCell.classList.add("empty-cell");
    emptyCell.colSpan = 1;
  
    if (Object.keys(fragments).length === 0) {
      const emptyCell = dataRow.insertCell();
      emptyCell.classList.add("empty-cell");
    }
  
    // Display table
    document.getElementById("output1").innerHTML = "";
    document.getElementById("output1").appendChild(table);
  }
  

  

}
// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
