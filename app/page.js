"use client";

import { useState, useEffect, useRef } from "react";
import "@fontsource/permanent-marker";
import "./page.css";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
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

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "none",
  borderRadius: "10px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const recipeModalStyle = {
  ...modalStyle,
  width: 800, // Increase the width for the recipe modal
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [recipeItems, setRecipeItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [openCameraModal, setOpenCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const [openRecipe, setOpenRecipe] = useState(false);

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

  const addMoreOfAnItem = async (item) => {
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
    }
  };

  const removeItem = async (item) => {
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
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenRecipe = () => {
    setRecipeItems(inventory.map((item) => item.name));
    setOpenRecipe(true);
  };
  const handleCloseRecipe = () => setOpenRecipe(false);

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
    return data.result;
  };

  const addItemFromImage = async () => {
    if (capturedImage) {
      const itemName = await identifyItem(capturedImage);
      await addItem(itemName);
    }
  };

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
      bgcolor={"#f5f5f5"}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          alignSelf: "center",
          mt: 8,
          mb: 4,
          color: "#33F020",
          fontFamily: "'Permanent Marker', cursive",
          fontWeight: "bold",
        }}
      >
        {`Welcome, Pantry Tracking made easy 😍 !`}
      </Typography>

      <Stack
        direction={"row"}
        justifyContent={"center"}
        alignItems={"center"}
        gap={2}
        width={"65vw"}
        sx={{
          bgcolor: "hsla(0, 0%, 100%, 0.5)",
          p: 3,
          borderRadius: "20px",
          boxShadow: 2,
        }}
      >
        <Button
          variant="contained"
          sx={{
            bgcolor: "#333",
            color: "white",
            "&:hover": {
              background: "#FFF",
              color: "#000",
            },
          }}
          onClick={handleOpen}
        >
          Add Item
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#333",
            color: "white",
            "&:hover": {
              background: "#FFF",
              color: "#000",
            },
          }}
          onClick={handleCameraOpen}
        >
          Identify & Add Item
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#333",
            color: "white",
            "&:hover": {
              background: "#FFF",
              color: "#000",
            },
          }}
          // onClick={() => generateRecipe(inventory.map((item) => item.name))}
          onClick={handleOpenRecipe}
        >
          Generate Recipe
        </Button>
      </Stack>

      <Stack
        sx={{
          width: "65vw",
          height: "55vh",
          overflowY: "auto",
          borderRadius: "20px",
          boxShadow: 2,
          bgcolor: "00FFFFFF",
        }}
        p={2}
        gap={2}
      >
        {inventory.map((item) => (
          <Stack
            key={item.name}
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            p={2}
            sx={{
              bgcolor: "hsla(0, 0%, 100%, 0.5)",
              borderRadius: "10px",
              boxShadow: 1,
            }}
          >
            <Typography variant="body1">{item.name}</Typography>
            <Typography variant="body1">{item.quantity}</Typography>
            <Stack direction={"row"} spacing={1}>
              <IconButton
                onClick={
                  (() => addMoreOfAnItem(item.name), console.log(item.name))
                }
              >
                <AddIcon />
              </IconButton>
              <IconButton onClick={() => removeItem(item.name)}>
                <RemoveIcon />
              </IconButton>
              <IconButton onClick={() => deleteItem(item.name)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Stack>
        ))}
      </Stack>

      {/* Modal for adding new item */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Add New Item
          </Typography>
          <TextField
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            sx={{ bgcolor: "#333", color: "white" }}
            onClick={() => {
              addItem(itemName);
              handleClose();
              setItemName("");
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>

      {/* Modal for generated recipe */}
      <Modal open={openRecipe} onClose={handleCloseRecipe}>
        <Box sx={recipeModalStyle}>
          <Typography
            id="recipe-modal-title"
            variant="h5"
            component="h2"
            fontWeight="bold"
          >
            Here is your Generated Recipe
          </Typography>

          <Typography variant="h6" component="h2">
            Ingredients:
          </Typography>

          <Typography
            id="recipe-modal-description"
            variant="body1"
            component="p"
            sx={{ mb: 2 }}
          >
            {recipeItems.length > 0 ? (
              recipeItems.map((item, index) => (
                <span key={index}>
                  - {item}
                  <br />
                </span>
              ))
            ) : (
              <span>No ingredients available in the inventory.</span>
            )}
          </Typography>

          <Typography variant="body1" component="p">
            - 1 cup of (melon seeds) <br />
            - 2 medium-sized Fish (e.g., catfish or tilapia) <br />
            - 1 tablespoon of ground Pepper (or to taste) <br />
            - 1 Salad Pack (for garnish or as a side dish) <br />
            - 2 cups of Soup broth (chicken or beef stock) <br />
          </Typography>

          {recipeItems.length > 0 ? (
            <div>
              {" "}
              <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                Instructions:
              </Typography>
              <Typography variant="body1" component="p">
                1. <strong>Prepare the Rice:</strong> In a dry skillet, lightly
                toast the egusi seeds until they are golden brown.
                <br />
                2. <strong>Cook the Fish:</strong> Clean and season the fish
                with salt, pepper, and any other desired seasonings.
                <br />
                3. <strong>Make the Egusi Soup:</strong> In the same pot, add
                the ground egusi and stir continuously.
                <br />
                4. <strong>Add the Fish:</strong> Gently place the fried fish
                into the pot, and let it simmer in the egusi soup for another
                10-15 minutes.
                <br />
                5. <strong>Prepare the oat:</strong> In a separate pot, bring
                water to a boil. 6. <strong>Serve:</strong> Serve the oat soup
                hot, with a portion of bread on the side.
              </Typography>{" "}
            </div>
          ) : (
            <h5>Can't find items in your pantry!!!</h5>
          )}

          <Button
            variant="contained"
            sx={{
              bgcolor: "#333",
              color: "white",
              "&:hover": {
                background: "#FFF",
                color: "#000",
              },
            }}
            onClick={handleCloseRecipe}
          >
            close
          </Button>
        </Box>
      </Modal>

      {/* Camera modal */}
      <Modal open={openCameraModal} onClose={handleCameraClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Capture Item Image
          </Typography>
          <video ref={videoRef} autoPlay style={{ width: "100%" }} />
          <Button
            variant="contained"
            sx={{ bgcolor: "#333", color: "white" }}
            onClick={captureImage}
          >
            Capture & Identify
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
