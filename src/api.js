// src/api.js

// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragments data', { data });
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}
export {getUserFragments}

export async function postUserFragments(user,textFrag, conType = "text/plain") {
  //conType = document.getElementById("textFrag").type
  console.log("\x1b[36m%s\x1b[0m", textFrag + ', '+ conType + ', ' + user.username + ' ' +document.getElementById("textFrag").type);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: user.authorizationHeaders(conType),
      body: textFrag.buffer,
    });
    if (!res.ok) {
      throw new Error(`{res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("Unable to call POST /v1/fragments"+ err.message,{err});
  }
}