// src/app.js

import { Auth, getUser } from "./auth";
import { getUserFragments, postUserFragments, getFragmentById } from "./api";

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
  let gotID;

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
    gotID = await getUserFragments(user);
    myDisplayer(gotID);
    //document.getElementById("output1").innerHTML = JSON.stringify(gotID,null, "\t");
  };

  FragmentByIdBtn.onclick = async () => {
    if (!FragId || FragId.value == "")
      alert("Fragment ID section can't be empty");
    else {
      gotID = await getFragmentById(user, FragId.value);
      console.log(gotID.data.fragment);
      myDisplayer(gotID);
      //document.getElementById("output1").innerHTML = JSON.stringify(gotID.data.fragment,null, "\t");
    }
  };

  function myDisplayer(some) {
    console.log(Object.keys(some).length);
    document.getElementById("output1").innerHTML = "";
    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.background = "darkblue";

    if (Object.keys(some).length == 1) {
      some1 = some.data.fragment;
      for (const key in some1) {
        if (Object.hasOwnProperty.call(some1, key)) {
          const row = table.insertRow();
          const keyCell = row.insertCell();
          const valueCell = row.insertCell();
          keyCell.innerText = key;
          valueCell.innerText = some1[key];
          row.classList.add("fragment-row");
        }
      }
    } else {
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
    // Display table
    document.getElementById("output1").innerHTML = "";
    document.getElementById("output1").appendChild(table);
  }

  /*function myDisplayerFrag(fragment) {
    const table = document.createElement("table");
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.background = "darkblue";

    // Create table data

    for (const key in fragment) {
      if (Object.hasOwnProperty.call(fragment, key)) {
        const row = table.insertRow();
        const keyCell = row.insertCell();
        const valueCell = row.insertCell();
        keyCell.innerText = key;
        valueCell.innerText = fragment[key];
        row.classList.add("fragment-row");
      }
    }

    // Display table
    document.getElementById("output1").innerHTML = "";
    document.getElementById("output1").appendChild(table);
  }*/
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
