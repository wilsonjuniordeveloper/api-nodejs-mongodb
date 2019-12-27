const express = require('express');
const authMiddleware= require('../middlewares/auth')
const router = express.Router();


const Project = require('../models/projects')
const task = require('../models/task')


router.use(authMiddleware);

router.get('/', async (req, res) =>{
    try{
        const project = await Project.find().populate('user');

        return res.send({ project })
    }catch(err){
        return res.status(400).send({error: 'erro write project'})
    }
})

router.get('/:projectId', async (req,res) =>{
    try{
        const project = await Project.findById(req.params.projectId).populate('user');

        return res.send({ project })
    }catch(err){
        return res.status(400).send({error: 'erro write project'})
    }
})    


router.post('/', async (req, res) =>{
    try{
        const project = await Project.create({...req.body, user: req.userId})

        return res.send({ project })
    }catch(err){
        return res.status(400).send({error: 'erro create new project'})
    }



})

router.put('/:projectId', async (req, res) =>{
    res.send({user: req.userId})
})



router.delete('/:projectId', async (req, res) =>{
    try{
    await Project.findByIdAndRemove(req.params.projectId);

        return res.send()
    }catch(err){
        return res.status(400).send({error: 'erro delete in project'})
    }
})





module.exports = app => app.use('/projects', router);