import {
    createDataItemSigner,
    dryrun,
    message,
  } from '@permaweb/aoconnect';
import dotenv from 'dotenv';  
import fs from 'fs';

dotenv.config();

const wallet = JSON.parse(process.env.VITE_APP_JWK);
const ORCHESTRATOR_NODE_ID = process.env.VITE_APP_AO_ORCHESTRATOR_ID

const dataValidUserSchema = await getLatestSchemaManagement("user");
console.log(dataValidUserSchema);


async function getLatestSchemaManagement(node_type) {
    const data =JSON.stringify( {node_type: node_type});
    return await dryrun({
        process: ORCHESTRATOR_NODE_ID,
        data: data,
        tags: [{ name: 'Action', value: 'GetLatestSchemaManagement' }],
    });
}

await loadNodeScripts();

async function loadNodeScripts() {
    await loadUserApi();
    await loadFheApi();
}

async function loadUserApi() {
    const user_process_api = fs.readFileSync('./process/user_process_api.lua', 'utf-8');
    const nodeApi = {
        node_type: "user",
        script_name: "user_process_api.lua",
        script_version: "v1.0",
        script_content: user_process_api
    };
    const data = JSON.stringify(nodeApi);
    const msgId = await loadApi(data);
    console.log(msgId);
    const dataValid = await getLatestApi("user");
    console.log(dataValid);
}

async function loadFheApi() {
    const fhe_process_api = fs.readFileSync('./process/fhe_process_api.lua', 'utf-8');
    const nodeApi = {
        node_type: "crypto",
        script_name: "fhe_process_api.lua",
        script_version: "v1.0",
        script_content: fhe_process_api
    };
    const data = JSON.stringify(nodeApi);
    const msgId = await loadApi(data);
    console.log(msgId);
    const dataValid = await getLatestApi("crypto");
    console.log(dataValid);
}

async function loadApi(data) {
    return await message({
        process: ORCHESTRATOR_NODE_ID,
        signer: createDataItemSigner(wallet),
        data: data,
        tags: [{ name: 'Action', value: 'InsertNodeScript' }],
    });

}

async function getLatestApi(node_type) {
    const data = {node_type: node_type};
    return await dryrun({
        process: ORCHESTRATOR_NODE_ID,
        data: JSON.stringify(data),
        tags: [{ name: 'Action', value: 'GetLatestNodeScript' }],
    });

}
