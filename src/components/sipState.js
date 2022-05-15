import React from 'react'
import Gun from 'gun'
import {useEffect, useState} from 'react'

const gun = Gun({
  peers: ['https://gun-manhattan.herokuapp.com/gun'] // Put the relay node that you want here
})

const GunTest = (props) => {

  const [txt, setTxt] = useState()

  useEffect(() => {
   
    gun.get('solace-sips').once((node) => { // Retrieve the text value on startup
      console.log(node)
      if(node === undefined) {
        gun.get('solace-sips').put({text: "No SIPs found. Paste SIPs here."})
      } else {
        console.log("Found SIPs")
        setTxt(node.text)
      }
    })

    gun.get('solace-sips').on((node) => { // Is called whenever text is updated
      console.log("Receiving Update")
      console.log(node)
      setTxt(node.text)
    })
  }, [])

  const updateText = (event) => {
    console.log("Updating SIPs")
    console.log(event.target.value)
    gun.get('solace-sips').put({text: event.target.value}) // Edit the value in our db
    setTxt(event.target.value)
  }

  return (
    <div>
      <h1>{"DEBUGGING"}</h1>
      <textarea value = {txt} onChange = {updateText}/>
    </div>
    
  );
}

export default GunTest;