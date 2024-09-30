const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const url = 'mongodb+srv://rajarajanshrihari:rajarajan15@database1.ubh3w.mongodb.net/'
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const upload = multer();
app.use(cors());
app.use(bodyParser.json());
// MongoDB connection

mongoose.connect(url);
const con = mongoose.connection;

con.on('open',()=>{
  console.log('connected');
})

const SheetSchema = new mongoose.Schema({
  name: String,
  cells: [{
    value: String,
    rowspan: Number,
    colspan: Number,
    isEditable: Boolean,
    isBold: Boolean,
    row: Number,
    col: Number,
    note: String
  }]
});

const Sheet = mongoose.model('Sheet', SheetSchema);

app.post('/api/save-sheet', async (req, res) => {
  try {
    const sheet = new Sheet(req.body);
    await sheet.save();
    res.json({ id: sheet._id });
  } catch (error) {
    res.status(500).json({ error: 'Error saving sheet' });
  }
});

app.patch('/api/update-sheet/:id', async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sheet);
  } catch (error) {
    res.status(500).json({ error: 'Error updating sheet' });
  }
});

app.get('/api/sheets',async(req,res)=>{
  try{
    const doc = await Sheet.find();
    res.json(doc);
  }catch(err){
    res.status(500).json('Error',err);
  }
})

app.delete('/api/deleteall',async(req,res)=>{
  try{
    const doc = await Sheet.deleteMany();
    res.json(doc);
  }catch(err){
    res.status(500).json('Error deleting data!',err);
  }
})

app.get('/api/get-sheet/:id', async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id);
    res.json(sheet);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving sheet' });
  }
});

app.delete('/api/delete/:id',async(req,res)=>{
  try{
    const removedDoc = await Sheet.findByIdAndDelete(req.params.id);
    res.json(removedDoc);
  }catch(err){
    res.status(200).json({error: 'Error removing sheet', err});
  }
})

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});