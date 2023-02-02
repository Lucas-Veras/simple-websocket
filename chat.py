import asyncio
import json
import logging

import websockets

logging.basicConfig()

USERS = set()
MESSAGES = []
VALUE = 0

def users_event():
    return json.dumps({"type": "users", "count": len(USERS)})

def value_event():
    return json.dumps({"type": "value", "value": VALUE})

def message_event():
    return json.dumps({"type": "message", "messages": MESSAGES})

async def chat(websocket):
    global USERS, VALUE
    try:
        USERS.add(websocket)
        websockets.broadcast(USERS, users_event())
        
        await websocket.send(value_event())
       
        async for message in websocket:
            event = json.loads(message)
            if event["action"] == "minus":
                VALUE -= 1
                websockets.broadcast(USERS, value_event())
            elif event["action"] == "plus":
                VALUE += 1
                websockets.broadcast(USERS, value_event())
            elif event["action"] == "message":
                MESSAGES.append(event["message"])
                websockets.broadcast(USERS, message_event())
            else:
                logging.error("unsupported event: %s", event)
    finally:
        USERS.remove(websocket)
        websockets.broadcast(USERS, users_event())
        

async def main():
    async with websockets.serve(chat, "localhost", 6789):
        await asyncio.Future() 
    

if __name__ == "__main__":
    asyncio.run(main())