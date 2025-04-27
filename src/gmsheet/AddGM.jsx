import axios from 'axios';
import React, { useState, useEffect } from 'react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";




const AddGM = ({ refreshlst, setRefreshlst, screen, accountdata, appAccountId, appProjectId, appSowId }) => {

    const [initialData, setInitialData] = useState({
        slno: 0,
        brspdMgr: "",
        program: "",
        status: "Active",
        name: "",
        roleaspersow: "",
        duration: "",
        startdate: null,
        enddate: null,
        location: "Offshore",
        type: "salaried",
        hours: "",
        billrate: "",
        payrate: "",
        loadedrate: "",
        billable: "Yes",
        accountId: 0,
        projectId: 0,
        sow: 0,
        test: ""
    })


    const [rows, setRows] = useState([
        initialData
    ])

    const [listdata, setlistdata] = useState([])
    const [refresh, setRefresh] = useState(true);


    const [accountId, setAccountId] = useState(0);
    const [projectId, setProjectId] = useState(0);
    const [sowId, setSowId] = useState(0);

    useEffect(() => {
        setAccountId(appAccountId);
        setProjectId(appProjectId);
        setSowId(appSowId);
        setInitialData({ ...initialData, accountId: appAccountId, projectId: appProjectId, sow: appSowId })
        setRows([{ ...initialData, accountId: appAccountId, projectId: appProjectId, sow: appSowId }])
    }, [appAccountId, appProjectId, appSowId])

    const [isNewProject, setisNewProject] = useState(false);


    const handleChange = (evnt, ind) => {
        const { name, value } = evnt.target;
        let updatedrows = rows.map((row, i) => (
            ind == i ? {
                ...row, [name]: value
            } : row
        ))
        setRows(updatedrows)
        if (name == "payrate" || name == "location") {
            setTimeout(() => {
                setRefresh(i => !i)
            }, 100)
        }
    }

    const addRow = () => {
        let newRow = {
            //...initialData,
            ...rows[rows.length - 1],
            slno: rows.length + 1,
            projectId: projectId,
            accountId: accountId,
            sow: sowId
        }
        setRows([...rows, newRow])
    }

    const deleterow = (index) => {
        let deleterows = rows.filter((_, i) => index != i)
        setRows(deleterows)
    }

    const handleDelete = (Id) => {
        axios.delete(`http://localhost:5071/api/GM/${Id}`).then(res => {
            getdata(accountId, projectId)
        })
    }

    const handleDateChange = (date, indx, stdate) => {
        if (stdate == "startdate") {
            let updatedrows = rows.map((row, i) => (
                indx == i ? {
                    ...row, [stdate]: date, enddate: row.enddate && date > row.enddate ? null :
                        row.enddate
                } : row
            ))
            setRows(updatedrows)
        }
        else {
            let updatedrows = rows.map((row, i) => (
                indx == i ? {
                    ...row, [stdate]: date
                } : row
            ))
            setRows(updatedrows)
        }
    }

    const handleSave = () => {
        if (accountId == 0 || projectId == 0 || sowId == 0) {
            alert("Please select Account and Project")
            return
        }
        axios.post("http://localhost:5071/api/GM", rows).then(res => {
            setisNewProject(true)
            setRows([initialData])
            setRefreshlst(o => !o)
            getdata(accountId, projectId)
        })
    }

    const getdata = (accountId, projectId) => {
        axios.get(`http://localhost:5071/api/GM/${accountId}/${projectId}`).then(res => {
            console.info("res", res)
            if (isNewProject && res.data?.length > 0)
                setlistdata(res.data)
            else if (!isNewProject && res.data?.length > 0) {
                setlistdata(res.data)
            }
        })
    }

    const convertDate = (date) => {
        if (!date) return "";
        return date.split("T")[0]
    }

    useEffect(() => {
        if (accountId > 0 && projectId > 0) {
            getdata(accountId, projectId)
        }
    }, [refreshlst, projectId, accountId]
    )

    useEffect(() => {
        let updatedrows = rows.map((row, i) => {
            if (row.location == 'Onshore' && row.type == 'salaried') {
                return {
                    ...row, loadedrate: (parseInt(row.payrate) * 1.23).toFixed(2) + ""
                }
            }
            else if (row.type == 'contractor') {
                return {
                    ...row, loadedrate: (parseInt(row.payrate) * 1.05).toFixed(2) + ""
                }

            }
            else if (row.type == 'hourely') {
                return {
                    ...row, loadedrate: (parseInt(row.payrate) * 1.12).toFixed(2) + ""
                }
            }

            else if (row.type === 'employee' || row.type == 'shared') {
                return {
                    ...row, loadedrate: (parseInt(row.payrate) * 1.056).toFixed(2) + ""
                }
            }
            else if (row.location == 'Offshore') {
                return {
                    ...row, loadedrate: (parseInt(row.payrate) * 1.056).toFixed(2) + ""
                }
            }
            else {
                return row
            }
        })
        setRows(updatedrows)

    }, [refresh])

    useEffect(() => {
        if (accountId > 0) {
            let updatedrows = rows.map((row, i) => (
                {
                    ...row, accountId: accountId
                }
            ))
            setRows(updatedrows)
        }

    }, [accountId])

    useEffect(() => {
        if (projectId > 0) {
            let updatedrows = rows.map((row, i) => (
                {
                    ...row, projectId: projectId
                }
            ))
            setRows(updatedrows)
        }

    }, [projectId])

    useEffect(() => {
        if (sowId > 0) {
            let updatedrows = rows.map((row, i) => (
                {
                    ...row, sow: sowId
                }
            ))
            setRows(updatedrows)
        }

    }, [sowId])

    return (
        <>
            <div>

                <div className='text-lg font-bold'>
                    Account Name: {accountdata?.account?.accountName}
                    <br />
                    Project Name: {accountdata?.project?.projectName}

                </div>

                <div className='overflow-x-auto w-full'>
                    <table className='min-w-full divide-y divide-gray-100 text-sm'>
                        <thead className="bg-blue-300 py-2">
                            <tr className='whitespace-nowrap px-3 py-3 text-[14px]'>
                                <th className='p-2'>
                                    S.No
                                </th>
                                <th className='p-2'>BRSPD Mgr</th>
                                <th className='p-2'>Program</th>
                                <th className='p-2'>Status</th>
                                <th className='p-2'>Name</th>
                                <th className='p-2'>Role as per SOW</th>
                                <th className='p-2'>Duration</th>
                                <th className='p-2'>Start Date</th>
                                <th className='p-2'>End Date</th>
                                <th className='p-2'>Location</th>
                                <th className='p-2'>Type</th>
                                <th className='p-2'>Hours</th>
                                <th className='p-2'>Bill Rate</th>
                                <th className='p-2'>Pay Rate</th>
                                <th className='p-2'>Loaded Rate</th>
                                <th className='p-2'>Billable</th>
                                <th className='p-2'>Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200" >
                            {
                                rows.map((row, i) => (
                                    <tr key={"row" + i}>
                                        <td>{i + 1}</td>
                                        <td><input className='w-36 px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' type='text' value={row.brspdMgr} name='brspdMgr' onChange={(e) => { handleChange(e, i) }} /> </td>
                                        <td><input className='w-36 px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' type='text' value={row.program} name='program' onChange={(e) => { handleChange(e, i) }} /> </td>
                                        <td>
                                            <select className='w-36 px-8 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' value={row.status} name='status' onChange={(e) => { handleChange(e, i) }}>
                                                <option value={"Active"}>Active</option>
                                                <option value={"InActive"}>InActive</option>
                                            </select>
                                        </td>
                                        <td><input className='w-36 px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' type='text' value={row.name} name='name' onChange={(e) => { handleChange(e, i) }} /> </td>
                                        <td><input className='w-36 px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' type='text' value={row.roleaspersow} name='roleaspersow' onChange={(e) => { handleChange(e, i) }} /> </td>
                                        <td><input type='number' min={1} className='w-36 px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' value={row.duration} name='duration' onChange={(e) => { handleChange(e, i) }} /> </td>

                                        <td>
                                            <DatePicker className='px-2 py-2 w-36 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                selected={row.startdate}
                                                onChange={(d) => handleDateChange(d, i, "startdate")}
                                                placeholderText={`Select Date`}
                                                dateFormat={'dd/MM/yyyy'}
                                            />
                                        </td>
                                        <td>
                                            <DatePicker className='px-2 py-2 w-36 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                selected={row.enddate}
                                                onChange={(d) => handleDateChange(d, i, "enddate")}
                                                placeholderText={`Select Date`}
                                                startDate={row.startdate}
                                                minDate={row.startdate}
                                                disabled={!row.startdate}
                                                dateFormat={'dd/MM/yyyy'}
                                            />
                                        </td>

                                        <td>
                                            <select className='w-36 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' value={row.location} name='location' onChange={(e) => { handleChange(e, i) }}>
                                                <option value={"Offshore"}>Offshore</option>
                                                <option value={"Onshore"}>Onshore</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select className='w-36 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' value={row.type} name='type' onChange={(e) => { handleChange(e, i) }}>
                                                <option value={"salaried"}>Salaried</option>
                                                <option value={"contractor"}>Contractor</option>
                                                <option value={"hourely"}>Hourely</option>
                                                <option value={"employee"}>Employee</option>
                                                <option value={"shared"}>Shared</option>
                                            </select>
                                        </td>
                                        <td><input type='number' className='w-36 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' value={row.hours} name='hours' min={1} maxLength={5} onChange={(e) => { handleChange(e, i) }} /> </td>
                                        <td><input type='number' className='w-36 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' value={row.billrate} name='billrate' min={1} maxLength={5} onChange={(e) => { handleChange(e, i) }} /> </td>
                                        <td><input type='number' className='w-36 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' value={row.payrate} name='payrate' min={1} maxLength={5} onChange={(e) => { handleChange(e, i) }} /> </td>
                                        <td><input className='w-36 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' type='text' value={row.loadedrate} readOnly /> </td>
                                        <td>
                                            <select className='w-36 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' value={row.billable} name='billable' onChange={(e) => { handleChange(e, i) }}>
                                                <option value={"Yes"}>Yes</option>
                                                <option value={"No"}>No</option>
                                            </select>
                                        </td>
                                        <td>{
                                            rows.length === i + 1 ?
                                                <div className='flex'>
                                                    {
                                                        rows.length > 1 && <button className='text-red-600 py-2 px-2 rounded hover:text-red-800 transition-colors' type='button' onClick={() => deleterow(i)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-8">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    }
                                                    <button className='text-blue-600 py-2 pl-2 rounded hover:text-blue-800 transition-colors' type='button' onClick={addRow}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-8">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                        </svg>
                                                    </button>
                                                </div> :
                                                <button className='text-red-600 py-2 px-2 rounded hover:text-red-800 transition-colors' type='button' onClick={() => deleterow(i)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-8">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                        }</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <div className='flex justify-end'>
                    <button
                        // disabled={!((screen == "Create" && listdata.length == 0) || screen == "Edit" || isNewProject)}
                        className='bg-blue-600 text-white m-2 py-2 px-10 mb-5 hover:bg-blue-800 rounded-lg text-[20px] disabled:cursor-not-allowed disabled:opacity-50' onClick={handleSave}>Save</button>
                </div>
            </div>
            {
                ((screen == "Create" && listdata.length > 0 && isNewProject) || screen == "Edit" || isNewProject) &&

                <div className='overflow-x-auto w-full'>
                    <table className="min-w-full border border-gray-600 text-sm text-left">
                        <thead className='bg-blue-300 py-2' >
                            <tr className='whitespace-nowrap px-3 py-3 text-[14px]'>
                                <th>
                                    S.No
                                </th>
                                <th className='px-4 py-4 border border-gray-600'>BRSPD Mgr</th>
                                <th className='px-4 py-4 border border-gray-600'>Program</th>
                                <th className='px-4 py-4 border border-gray-600'>Status</th>
                                <th className='px-4 py-4 border border-gray-600'>Name</th>
                                <th className='px-4 py-4 border border-gray-600'>Role as per SOW</th>
                                <th className='px-4 py-4 border border-gray-600'>Durtion</th>
                                <th className='px-4 py-4 border border-gray-600'>Start Date</th>
                                <th className='px-4 py-4 border border-gray-600'>End Date</th>
                                <th className='px-4 py-4 border border-gray-600'>Location</th>
                                <th className='px-4 py-4 border border-gray-600'>Type</th>
                                <th className='px-4 py-4 border border-gray-600'>Hour</th>
                                <th className='px-4 py-4 border border-gray-600'>Bill Rate</th>
                                <th className='px-4 py-4 border border-gray-600'>Pay Rate</th>
                                <th className='px-4 py-4 border border-gray-600'>Loaded Rate</th>
                                <th className='px-4 py-4 border border-gray-600'>Billable</th>
                                <th className='px-4 py-4 border border-gray-600'>Total Monthly Spend</th>
                                <th className='px-4 py-4 border border-gray-600'>Total Year Spend</th>
                                <th className='px-4 py-4 border border-gray-600'>Total Cost</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600 bg-Black" style={{ backgroundColor: 'wheat' }} >
                            {
                                listdata.map((row, i) => (
                                    <tr className="px-6 py-4" key={"rowlst" + i}>
                                        <td className="px-2 py-4">{i + 1}</td>
                                        <td className="p-2 border border-gray-600">{row.brspdMgr}</td>
                                        <td className="p-2 border border-gray-600">{row.program}</td>
                                        <td className="p-2 border border-gray-600">{row.status}</td>
                                        <td className="p-2 border border-gray-600">{row.name}</td>
                                        <td className="p-2 border border-gray-600">{row.roleaspersow}</td>
                                        <td className="p-2 border border-gray-600">{row.duration}</td>
                                        <td className="p-2 border border-gray-600">{convertDate(row.startdate)}</td>
                                        <td className="p-2 border border-gray-600">{convertDate(row.enddate)}</td>
                                        <td className="p-2 border border-gray-600">{row.location}</td>
                                        <td className="p-2 border border-gray-600">{row.type}</td>
                                        <td className="p-2 border border-gray-600">{row.hours}</td>
                                        <td className="p-2 border border-gray-600">{row.billrate}</td>
                                        <td className="p-2 border border-gray-600">{row.payrate}</td>
                                        <td className="p-2 border border-gray-600">{row.loadedrate ? Number(row.loadedrate).toFixed(2) : '0.00'}</td>
                                        <td className="p-2 border border-gray-600">{row.billable}</td>
                                        <td className='p-2 border border-gray-600'>
                                            {row.status === 'Active' && row.billable === 'Yes' && (
                                                <td>{(row.billrate * 168).toFixed(2)}</td>
                                            )}
                                        </td>
                                        <td className='p-2 border border-gray-600'>
                                            {
                                                row.duration !== "" && (
                                                    <td>{(row.billrate * 168 * row.duration).toFixed(2)} </td>
                                                )}
                                        </td>
                                        <td className='p-2 border border-gray-600'>
                                            {row.status === 'Active' && row.billable === 'Yes' && (
                                                <td>{(row.loadedrate * 168 * 12).toFixed(2)}</td>
                                            )}
                                        </td>
                                        <td>
                                            <button className='text-green-700' style={{ color: 'red' }} onClick={() => handleDelete(row.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            }
        </>
    )
}
export default AddGM
