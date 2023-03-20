// src/app.js

import { Auth, getUser } from "./auth";
import { getUserFragments, postUserFragments, getFragmentById, getFragmentByIdInfo } from "./api";

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
          const gotID = await getUserFragments(user,0)
          console.log(gotID)
          displayMultipleFragments(gotID);
          console.log('Displaying Data', fragment.data.fragment.ownerId+' '+gotID);
        });
        idbuttonCell.appendChild(idbutton);
      }
      if (key === 'type') {
        const typebuttonCell = row.insertCell();
        const typebutton = document.createElement('button');
        typebutton.innerText = 'Convert type';
        typebutton.addEventListener('click', async()  => {
          const gotID = await getUserFragments(user,0)
          console.log(gotID)
          displayMultipleFragments(gotID);
          console.log('Converting type', fragment.data.fragment.ownerId+' '+gotID);
        });
        typebuttonCell.appendChild(typebutton);
      }
      if (key === 'updated') {
        const updatedbuttonCell = row.insertCell();
        const updatedbutton = document.createElement('button');
        updatedbutton.innerText = 'Update Fragment';
        updatedbutton.addEventListener('click', async()  => {
          const gotID = await getUserFragments(user,0)
          console.log(gotID)
          displayMultipleFragments(gotID);
          console.log('Update Fragment', fragment.data.fragment.ownerId+' '+gotID);
        });
        updatedbuttonCell.appendChild(updatedbutton);
      }
    }
  }

  // Display table
  document.getElementById("output1").innerHTML = "";
  document.getElementById("output1").appendChild(table);
}


  function myDisplayer(some) {
    console.log(Object.keys(some).length);
    document.getElementById("output1").innerHTML = "";
    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.background = "darkblue";

    some.fragments.forEach((fragment) => {
        for (const key in fragment) {
          if (Object.hasOwnProperty.call(fragment, key)) {
            const dataRow = table.insertRow();
            const headerCell = dataRow.insertCell();
            headerCell.innerText = key;
            headerCell.style.fontWeight = "bold";
            headerCell.style.padding = "8px";
            const dataCell = dataRow.insertCell();
            dataCell.innerText = fragment[key];
            dataCell.style.padding = "8px";
            if (key === 'ownerId') {
              const userbuttonCell = dataRow.insertCell();
              const userbutton = document.createElement('button');
              userbutton.innerText = 'Find All by user';
              userbutton.addEventListener('click', async()  => {
                const gotID = await getUserFragments(user,1)
                console.log(gotID)
                myDisplayer(gotID);
                console.log('Edit button clicked for userId', fragment.ownerId+' '+gotID);
              });
              userbuttonCell.appendChild(userbutton);
            }
          }
        }
        // Create an empty row after the 'size' row
        const emptyRow = table.insertRow();
        const emptyCell = emptyRow.insertCell();
        emptyCell.classList.add("empty-cell");
        emptyCell.colSpan = Object.keys(some.fragments[0]).length;

        if (Object.keys(fragment).length === 0) {
          const emptyCell = dataRow.insertCell();
          emptyCell.classList.add("empty-cell");
        }
      });
    }
   
  

  function displayMultipleFragments(fragments) {
    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.background = "darkblue";
  
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
        //console.log(fragment.id)
        const singleFragment = await getFragmentById(user, fragment);
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
