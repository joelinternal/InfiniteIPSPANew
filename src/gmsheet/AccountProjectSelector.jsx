import React, { useEffect, useState } from 'react'
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { set } from 'date-fns';
import axios from 'axios';
import { Autocomplete, TextField, Chip, Box, CircularProgress } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


const AccountProjectSelector = ({ setShowCreateGMSheet, screen, open, setOpen, projectId, setProjectId, accountId, setAccountId, sowId, SetsowId, setaccountdata }) => {

    const [pId, setpId] = useState(0)
    const [aId, setaId] = useState(0)
    const [sId, setsId] = useState(0)
    const [accounts, setaccounts] = useState([])
    const [projects, setprojects] = useState([])
    const [refreshsow, setrefreshsow] = useState(true)

    const [sow, setsow] = useState([
    ]);

    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event, value) => {
        setInputValue(value);
        let sowoptions = sow.find(a => a.sowName == value)
        setsId(sowoptions ? sowoptions.sowId : 0)
        setaccountdata(sow.find(a => a.sowName == value))
    };

    const handleCreateNewOption = () => {
        if (inputValue && !sow.some(option => option.sowName === inputValue)) {
            const newOption = {
                AccountId: aId,
                ProjectId: pId,
                sowName: inputValue
            };
            axios.post(`http://localhost:5071/api/Account/Sow`, newOption).then(res => {
                console.info("res", res)
                setsow(x => [...x, res.data])
                setInputValue(res.data.sowName);
                setsId(res.data.sowId)
                setrefreshsow(a => !a)              
            })
        }
    };



    const handleselect = () => {
        if (aId == 0 || pId == 0 || sId == 0) {
            return
        }
        setAccountId(aId)
        setProjectId(pId)
        SetsowId(sId)
        setShowCreateGMSheet(screen)
        setOpen(false)
    }

    const getaccountdata = () => {
        axios.get(`http://localhost:5071/api/Account`).then(res => {
            console.info("res", res)
            setaccounts(res.data)
        })
    }

    useEffect(() => {
        getaccountdata()
    }, [])

    const getprojectdata = (id) => {
        axios.get(`http://localhost:5071/api/Account/Projects/${id}`).then(res => {
            console.info("res", res)
            setprojects(res.data)
        })
    }

    useEffect(() => {
        if (aId > 0) {
            getprojectdata(aId)
        }
    }, [aId])

    const getsowdata = () => {
        axios.get(`http://localhost:5071/api/Account/Sow/${aId}/${pId}`).then(res => {
            console.info("res", res)
            setsow(res.data)

            let sdata = res.data;
            if (sdata.length > 0 && sId > 0) {
                setaccountdata(sdata.find(a => a.sowId == sId))
            }
        })
    }

    useEffect(() => {
        if (aId > 0 && pId > 0) {
            getsowdata()
        }

    }, [aId, pId, refreshsow])

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box className='!shadow-2xl !border-4 bg-white !border-blue-600 rounded-xl' sx={style}>
                        <div className='flex justify-end -m-4'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6 cursor-pointer text-red-600 hover:text-red-800" onClick={() => setOpen(false)}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div className='flex justify-between'>
                            <select value={aId} className='px-4 py-1 h-12 mt-2 mr-5 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' onChange={(e) => { setaId(e.target.value) }}>
                                <option value={0}>Select Account</option>
                                {accounts.map((account, id) => (
                                    <option value={account.accountId} key={"accounts" + id}>{account.accountName}</option>
                                ))}
                            </select>

                            <select value={pId} className='px-4 mr-5 py-1 mt-2 h-12 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' onChange={(e) => { setpId(e.target.value) }}>
                                <option value={0}>Select Project</option>
                                {
                                    projects.map((project, id) => (
                                        <option value={project.projectId} key={"projects" + id}>{project.projectName}</option>
                                    ))
                                }
                            </select>

                            <Box sx={{ width: 120 }}>

                                <Autocomplete
                                    freeSolo
                                    value={inputValue}
                                    onInputChange={handleInputChange}
                                    options={sow.map(option => option.sowName)} // Map the options to their values for display
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select or Create"
                                            variant="outlined"
                                            onBlur={handleCreateNewOption} // Create new option on blur
                                        />
                                    )}
                                    renderOption={(props, option) => {
                                        const optionData = sow.find(opt => opt.sowName === option); // Find the option with matching value
                                        return (
                                            <li {...props}>
                                                <Chip label={optionData.sowName} />
                                            </li>
                                        );
                                    }}
                                    isOptionEqualToValue={(option, value) => option === value}
                                    disableClearable
                                />
                            </Box>
                        </div>
                        <div className='flex justify-center mt-5'>
                            <button className='bg-blue-600 text-white m-2 py-2 px-10 hover:bg-blue-800 rounded-lg' onClick={handleselect}>Select</button>
                        </div>
                    </Box>
                </Fade>
            </Modal>
        </div>
    )
}
export default AccountProjectSelector
