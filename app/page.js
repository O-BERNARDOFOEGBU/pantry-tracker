// "use client";

// import { useState, useEffect } from "react";
// import {
//   Box,
//   Stack,
//   Typography,
//   Button,
//   Modal,
//   TextField,
// } from "@mui/material";
// import { firestore } from "@/firebase";
// import {
//   collection,
//   doc,
//   getDocs,
//   query,
//   setDoc,
//   deleteDoc,
//   getDoc,
// } from "firebase/firestore";

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 400,
//   bgcolor: "white",
//   border: "2px solid #000",
//   boxShadow: 24,
//   p: 4,
//   display: "flex",
//   flexDirection: "column",
//   gap: 3,
// };

// export default function Home() {
//   const [inventory, setInventory] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [itemName, setItemName] = useState("");

//   const updateInventory = async () => {
//     const snapshot = query(collection(firestore, "inventory"));
//     const docs = await getDocs(snapshot);
//     const inventoryList = [];
//     docs.forEach((doc) => {
//       inventoryList.push({ name: doc.id, ...doc.data() });
//     });
//     setInventory(inventoryList);
//   };

//   useEffect(() => {
//     updateInventory();
//   }, []);

//   const addItem = async (item) => {
//     const docRef = doc(collection(firestore, "inventory"), item);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       const { quantity } = docSnap.data();
//       await setDoc(docRef, { quantity: quantity + 1 });
//     } else {
//       await setDoc(docRef, { quantity: 1 });
//     }
//     await updateInventory();
//   };

//   const removeItem = async (item) => {
//     const docRef = doc(collection(firestore, "inventory"), item);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       const { quantity } = docSnap.data();
//       if (quantity === 1) {
//         await deleteDoc(docRef);
//       } else {
//         await setDoc(docRef, { quantity: quantity - 1 });
//       }
//     }
//     await updateInventory();
//   };

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   console.log(inventory);

//   return (
//     <Box
//       width="100vw"
//       height="100vh"
//       display={"flex"}
//       justifyContent={"center"}
//       flexDirection={"column"}
//       alignItems={"center"}
//       gap={2}
//     >
//       <Modal
//         open={open}
//         onClose={handleClose}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//       >
//         <Box sx={style}>
//           <Typography id="modal-modal-title" variant="h6" component="h2">
//             Add Item
//           </Typography>
//           <Stack width="100%" direction={"row"} spacing={2}>
//             <TextField
//               id="outlined-basic"
//               label="Item"
//               variant="outlined"
//               fullWidth
//               value={itemName}
//               onChange={(e) => setItemName(e.target.value)}
//             />
//             <Button
//               variant="outlined"
//               onClick={() => {
//                 addItem(itemName);
//                 setItemName("");
//                 handleClose();
//               }}
//             >
//               Add
//             </Button>
//           </Stack>
//         </Box>
//       </Modal>
//       <Button variant="contained" onClick={handleOpen}>
//         Add New Item
//       </Button>
//       <Box border={"1px solid #333"}>
//         <Box
//           width="800px"
//           height="100px"
//           bgcolor={"#ADD8E6"}
//           display={"flex"}
//           justifyContent={"center"}
//           alignItems={"center"}
//         >
//           <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
//             Inventory Items
//           </Typography>
//         </Box>
//         <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
//           {inventory.map(({ name, quantity }) => (
//             <Box
//               key={name}
//               width="100%"
//               minHeight="150px"
//               display={"flex"}
//               justifyContent={"space-between"}
//               alignItems={"center"}
//               bgcolor={"#f0f0f0"}
//               paddingX={5}
//             >
//               <Typography variant={"h3"} color={"#333"} textAlign={"center"}>
//                 {name.charAt(0).toUpperCase() + name.slice(1)}
//               </Typography>
//               <Typography variant={"h3"} color={"#333"} textAlign={"center"}>
//                 Quantity: {quantity}
//               </Typography>
//               <Button variant="contained" onClick={() => removeItem(name)}>
//                 Remove
//               </Button>
//             </Box>
//           ))}
//         </Stack>
//       </Box>
//     </Box>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import "./page.css";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import { firestore } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [openCameraModal, setOpenCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  // const addMoreOfAnItem = async (item) => {
  //   const docRef = doc(collection(firestore, "inventory"), item);
  //   const docSnap = await getDoc(docRef);
  //   if (docSnap.exists()) {
  //     const { quantity } = docSnap.data();
  //     await setDoc(docRef, { quantity: quantity + 1 });
  //   }
  //   await updateInventory();
  // };

  const addMoreOfAnItem = async (item) => {
    // Optimistically update the UI
    setInventory((prevInventory) =>
      prevInventory.map((i) =>
        i.name === item ? { ...i, quantity: i.quantity + 1 } : i
      )
    );

    const docRef = doc(collection(firestore, "inventory"), item);

    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      }
    } catch (error) {
      console.error("Error adding more of an item:", error);
      // Optionally: Rollback the optimistic UI update if needed
    }
  };

  // const removeItem = async (item) => {
  //   const docRef = doc(collection(firestore, "inventory"), item);
  //   const docSnap = await getDoc(docRef);
  //   if (docSnap.exists()) {
  //     const { quantity } = docSnap.data();
  //     if (quantity === 1) {
  //       await deleteDoc(docRef);
  //     } else {
  //       await setDoc(docRef, { quantity: quantity - 1 });
  //     }
  //   }
  //   await updateInventory();
  // };

  const removeItem = async (item) => {
    // Optimistically update the UI by filtering out the item if quantity reaches zero
    setInventory((prevInventory) =>
      prevInventory
        .map((i) => (i.name === item ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );

    const docRef = doc(collection(firestore, "inventory"), item);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef); // Delete the document if quantity is 1
        } else {
          await setDoc(docRef, { quantity: quantity - 1 }); // Decrease the quantity by 1
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
      // Optionally: Rollback the optimistic UI update if needed
    }
  };

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity > 1) {
        await deleteDoc(docRef);
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCameraOpen = () => {
    setOpenCameraModal(true);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing the camera", error);
      });
  };

  const handleCameraClose = () => {
    setOpenCameraModal(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    handleCameraClose();
  };

  const identifyItem = async (image) => {
    const response = await fetch("https://api.openai.com/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ image }),
    });

    const data = await response.json();
    return data.result; // Assuming the API returns the identified item name.
  };

  const addItemFromImage = async () => {
    if (capturedImage) {
      const itemName = await identifyItem(capturedImage);
      await addItem(itemName);
    }
  };

  // const generateRecipe = async (inventoryItems) => {
  //   const prompt = `Here are some items I have: ${inventoryItems?.join(
  //     ", "
  //   )}. Can you suggest a recipe?`;

  //   const response = await fetch(
  //     "https://api.openai.com/v1/engines/davinci-codex/completions",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //       },
  //       body: JSON.stringify({
  //         prompt: prompt,
  //         max_tokens: 100,
  //       }),
  //     }
  //   );

  //   const data = await response.json();
  //   return data?.choices[0]?.text.trim();
  // };

  const generateRecipe = async (inventoryItems) => {
    if (!inventoryItems || inventoryItems.length === 0) {
      alert("No items in inventory to generate a recipe.");
      return;
    }

    const prompt = `Here are some items I have: ${inventoryItems.join(
      ", "
    )}. Can you suggest a recipe?`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/engines/davinci-codex/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: prompt,
            max_tokens: 100,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recipe from OpenAI.");
      }

      const data = await response.json();
      return data.choices[0]?.text.trim() || "No recipe suggestion available.";
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("An error occurred while generating the recipe.");
      return "";
    }
  };

  return (
    <Box
      className="backgroundImage"
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={openCameraModal}
        onClose={handleCameraClose}
        aria-labelledby="camera-modal-title"
        aria-describedby="camera-modal-description"
      >
        <Box sx={style}>
          <Typography id="camera-modal-title" variant="h6" component="h2">
            Capture Image
          </Typography>
          <video
            ref={videoRef}
            autoPlay
            style={{ width: "100%", height: "auto" }}
          ></video>
          <Button variant="outlined" onClick={captureImage}>
            Capture
          </Button>
        </Box>
      </Modal>

      <Stack
        width="800px"
        // height="100px"
        bgcolor={"transparent"}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-around"}
        // alignItems={"center"}
      >
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
        <Button variant="contained" onClick={handleCameraOpen}>
          Add Item via Camera
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            const recipe = await generateRecipe(
              inventory.map((item) => item.name)
            );
            if (recipe) {
              alert(`Here’s a recipe you can make:\n${recipe}`);
            }
          }}
        >
          Generate Recipe
        </Button>
      </Stack>

      <Box border={"1px thin #eff"}>
        <Box
          width="800px"
          height="100px"
          bgcolor={"#ADD8E6"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="100px"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              bgcolor={"#f0f0f0"}
              paddingX={5}
            >
              <Typography variant={"h5"} color={"#333"} textAlign={"center"}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={"h5"} color={"#333"} textAlign={"center"}>
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" onClick={() => addMoreOfAnItem(name)}>
                add
              </Button>
              <Button variant="contained" onClick={() => removeItem(name)}>
                Remove
              </Button>
              <Button variant="contained" onClick={() => deleteItem(name)}>
                Delete
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
    // </Box>
  );
}
