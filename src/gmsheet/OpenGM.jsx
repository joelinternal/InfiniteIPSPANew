import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { saveAs } from "file-saver";

const OpenGM = ({ refreshlst, projectId, accountId, sowId, accountdata }) => {

    const [listdata, setlistdata] = useState([])
    const [listloadrunsheet, setloadrunsheet] = useState([])
    const [runSheetTableHeaders, setRunSheetTableHeaders] = useState([])
    const [runSheetTableMonthHeaders, setRunSheetTableMonthHeaders] = useState([])
    const [showRunSheet, setShowRunSheet] = useState(false);

    const [runSheetPayload, setRunSheetPayload] = useState([]);
    const [isRunSheetSave, setIsRunSheetSave] = useState(false);

    const [lstRevenueOnshore, setlstRevenueOnshore] = useState({
        "revenu": 0,
        "cost": 0,
        "margin": 0,
        "marginpercentage": 0,
        "totalrevenue": 0,
        "totalmargin": 0
    });

    const [lstRevenueOffshore, setlstRevenueOffshore] = useState({
        "revenu": 0,
        "cost": 0,
        "margin": 0,
        "marginpercentage": 0,
        "totalrevenue": 0,
        "totalmargin": 0
    });

    const [lstrunsheetsummary,setlstrunsheetsummary]=useState({
        "actualrevenueprojection":0,
        "afterdiscount":0,
        "plannedgmpercentage":0,
        "plannedgm":0,
        "plannedcostnottoextend":0,
        "actualcostprojection":0,
        "costoverrun":0,
        "projectgmpercentage":0,
        "balanceamountprojected":0
    })

    const [lstrunsheetsummaryYTD,setlstrunsheetsummaryYTD]=useState({
        "actualrevenueprojection":0,
        "afterdiscount":0,
        "plannedgmpercentage":0,
        "plannedgm":0,
        "plannedcostnottoextend":0,
        "actualcostprojection":0,
        "costoverrun":0,
        "projectgmpercentage":0,
        "balanceamountprojected":0
    })

    const getdata = (accountId, projectId) => {
        axios.get(`http://localhost:5071/api/GM/${accountId}/${projectId}`).then(res => {
            setlistdata(res.data)
        })
    }

    const handleloadrunsheet = () => {
        setShowRunSheet(true);
        axios.get(`http://localhost:5071/api/GM/Runsheet/${accountId}/${projectId}`).then(res => {
            setloadrunsheet(res.data?.gmRunSheet || [])
            setRunSheetTableHeaders(res.data?.columnHeader || []);
            setRunSheetTableMonthHeaders(res.data?.monthHeaders || []);
        })
    }

    const handleDelete = (Id) => {
        axios.delete(`http://localhost:5071/api/GM/${Id}`).then(res => {
            getdata()
        })
    }

    const getRevenue = () => {
        axios.get(`http://localhost:5071/api/GM/RevenueDetails/${accountId}/${projectId}`).then(res => {
            setlstRevenueOnshore(res.data?.onshore)
            setlstRevenueOffshore(res.data?.offshore)
        })
    }

    const getRunsheetSummary = () => {
        axios.get(`http://localhost:5071/api/GM/Runsheetsummary/${accountId}/${projectId}`).then(res => {
            setlstrunsheetsummary(res.data?.SummaryActual)
            setlstrunsheetsummaryYTD(res.data?.SummaryYTD)

        })
    }

    useEffect(() => {
        if (accountId > 0 && projectId > 0) {
            getdata(accountId, projectId)
            getRevenue()
        }
    }, [refreshlst, projectId, accountId])

    const convertDate = (date) => {
        if (!date) return "";
        return date.split("T")[0]
    }

    useEffect(() => {
        let payload = [];
        if (listloadrunsheet.length > 0) {
            listloadrunsheet.map((lst) => {
                lst.runsheet.map(r => {
                    if (r?.currentMonth) {
                        payload.push({ GmId: lst.gmId, month: r?.month, hours: r?.hours })
                    }
                })
            });
            setRunSheetPayload(payload);
            getRunsheetSummary();
        }
    }, [listloadrunsheet])


    const downloadExcel = async () => {
        try {
            const response = await fetch(`http://localhost:5071/api/GM/Excel/${accountId}/${projectId}`, {
                method: "Get",
                headers: {
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            });

            if (!response.ok) throw new Error("Failed to download file");

            const blob = await response.blob();
            const fileName = "exported_data.xlsx";
            saveAs(blob, fileName);
        } catch (error) {
            console.error("Error downloading the Excel file:", error);
        }
    };

    const handleSaveRunSheetChange = (evt, id, month) => {
        setIsRunSheetSave(true);
        let updatedPayload = runSheetPayload.map((row) => (
            id == row.GmId && row.month == month ? {
                ...row, hours: evt.target.value
            } : row
        ))
        setRunSheetPayload(updatedPayload)
    }

    const handleSaveRunSheet = () => {
        axios.post("http://localhost:5071/api/GM/SaveRunSheetUsers", runSheetPayload).then(res => {
            setIsRunSheetSave(false);
        })
    }

    return (
        <>
            {accountId > 0 && projectId > 0 && sowId > 0 &&
                <div>
                    <div className='text-lg font-bold'>
                        Account Name: {accountdata?.account?.accountName}
                        <br />
                        Project Name: {accountdata?.project?.projectName}
                    </div>
                    {!showRunSheet &&
                        <>
                            <div>
                                <table className='min-w-full divide-y divide-gray-200 text-sm border border-black' style={{ marginBottom: "2rem" }}>
                                    <thead className="bg-blue-300">
                                        <tr className='whitespace-nowrap px-3 py-3 text-[16px]'>
                                            <td></td>
                                            <td></td>
                                            <td className="border border-black px-4 py-2 text-center font-bold text-white bg-blue-800" colSpan={1} >Revenue
                                            </td>
                                            <td className="border border-black px-4 py-2 text-center font-bold" colSpan={4}>Onshore
                                            </td>
                                            <td className="border border-black px-4 py-2 text-center font-bold" colSpan={4}>Offshore
                                            </td>
                                            <td className="border border-black px-4 py-2 text-center font-bold" colSpan={2}>Overall
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-600">
                                        <tr className='whitespace-nowrap px-3 py-3 text-[14px]'>
                                            <td className="border border-black px-4 py-2 text-center"></td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Duration</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Total Revenue</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Revenue</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Cost</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Margin</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Margin %</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Revenue</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Cost</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Margin</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Margin %</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Overall Margin</td>
                                            <td className="border border-black px-4 py-2 text-center font-bold">Total Margin</td>
                                        </tr>
                                        <tr>
                                            <td>Proposed Rate</td>
                                            <td className="border border-black px-4 py-2 text-center">12 monts</td>
                                            <td className="border border-black px-4 py-2 text-center">{lstRevenueOffshore?.revenu + lstRevenueOnshore?.revenu}</td>
                                            <td className="border border-black px-4 py-2 text-center">{lstRevenueOnshore?.revenu}</td>
                                            <td className="border border-black px-4 py-2 text-center">{lstRevenueOnshore?.cost}</td>
                                            <td className="border border-black px-4 py-2 text-center">{lstRevenueOnshore?.margin.toFixed(2)}</td>
                                            <td className="border border-black px-4 py-2 text-center">{lstRevenueOnshore?.marginpercentage.toFixed(0)}%</td>
                                            <td className="border border-black px-4 py-2 text-center">{lstRevenueOffshore?.revenu}</td>
                                            <td className="border border-black px-4 py-2 text-center">{lstRevenueOffshore?.cost}</td>
                                            <td className="border border-black px-4 py-2 text-center">{lstRevenueOffshore?.margin.toFixed(2)}</td>
                                            <td className="border border-black px-4 py-2 text-center">{lstRevenueOffshore?.marginpercentage.toFixed(0)}%</td>
                                            <td className="border border-black px-4 py-2 text-center">{(((lstRevenueOffshore?.revenu + lstRevenueOnshore?.revenu) - (lstRevenueOffshore?.cost + lstRevenueOnshore?.cost)) / (lstRevenueOffshore?.revenu + lstRevenueOnshore?.revenu) * 100).toFixed(0)}%</td>
                                            <td className="border border-black px-4 py-2 text-center">{(lstRevenueOffshore?.margin + lstRevenueOnshore?.margin).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
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
                                                    <td className="p-2 border border-gray-600 whitespace-nowrap">{convertDate(row.startdate)}</td>
                                                    <td className="p-2 border border-gray-600 whitespace-nowrap">{convertDate(row.enddate)}</td>
                                                    <td className="p-2 border border-gray-600">{row.location}</td>
                                                    <td className="p-2 border border-gray-600">{row.type}</td>
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
                        </>
                    }
                    {
                        !showRunSheet &&
                        <div className='flex justify-center'>
                            <button className='bg-blue-600 text-white m-2 py-2 px-10 hover:bg-blue-800 rounded-xl text-[20px]' onClick={handleloadrunsheet}>Generate Runsheet</button>
                        </div>}

                    {showRunSheet && <>
                        <div className='flex items-start'>
                            <div className='m-4'>
                                <table className="border border-black shadow-lg">
                                    <tr className='bg-red-200 font-semibold text-center'>
                                        <td className='px-2 py-1 border border-black' colSpan={2}>Summary (Actual + Projection)</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Actual Revenue + Projection</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummary?.actualrevenueprojection}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>After Discount</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummary?.afterdiscount}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Planned GM %</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummary?.plannedgmpercentage}%</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Planned GM</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummary?.plannedgm}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Planned cost not to exceed</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummary?.plannedcostnottoextend}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Actual Cost + Projection</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummary?.actualcostprojection}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Cost Overrun / within limit</td>
                                        <td className='px-2 py-1 border border-black text-right'>{Math.abs(lstrunsheetsummary?.costoverrun)}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Projected GM</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummary?.projectgmpercentage}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Balance Amount Projected</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummary?.balanceamountprojected}</td>
                                    </tr>
                                </table>
                            </div>
                            <div className='m-4'>
                                <table className="border border-black shadow-lg">
                                    <tr className='bg-green-200 font-semibold text-center'>
                                        <td className='px-2 py-1 border border-black' colSpan={2}>Summary (YTD)</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Actual Revenue YTD</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummaryYTD?.actualrevenueprojection}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>After Discount</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummaryYTD?.afterdiscount}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Planned GM %</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummaryYTD?.plannedgmpercentage}%</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Planned GM</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummaryYTD?.plannedgm}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Planned cost not to exceed</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummaryYTD?.plannedcostnottoextend}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Actual Cost YTD</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummaryYTD?.actualcostprojection}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Cost Overrun / within limit</td>
                                        <td className='px-2 py-1 border border-black text-right'>{Math.abs(lstrunsheetsummaryYTD?.costoverrun)}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Actual GM</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummaryYTD?.projectgmpercentage}</td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1 border border-black'>Balance Amount YTD</td>
                                        <td className='px-2 py-1 border border-black text-right'>{lstrunsheetsummaryYTD?.balanceamountprojected}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div className='overflow-x-auto w-full'>
                            <table className="table-fixed border-collapse border border-black text-center">
                                <thead className='bg-blue-300'>
                                    <tr className='whitespace-nowrap px-4 text-[14px]'>
                                        <th colSpan={14}></th>
                                        {
                                            runSheetTableHeaders.map((runsheetHeaders, iH) => (
                                                <th className='px-2 py-2 border border-gray-600' key={"TableHeader-" + iH}>{runsheetHeaders}</th>
                                            ))
                                        }
                                        <th colSpan={4}></th>
                                    </tr>
                                    <tr className='whitespace-nowrap'>
                                        <th className='px-2 py-2 border border-gray-600'>BRSPD Mgr</th>
                                        <th className='px-2 py-2 border border-gray-600'>Program</th>
                                        <th className='px-2 py-2 border border-gray-600'>Status</th>
                                        <th className='px-2 py-2 border border-gray-600'>Name</th>
                                        <th className='px-2 py-2 border border-gray-600'>Role as per SOW</th>
                                        <th className='px-2 py-2 border border-gray-600'>Duration</th>
                                        <th className='px-2 py-2 border border-gray-600'>Start Date</th>
                                        <th className='px-2 py-2 border border-gray-600'>End Date</th>
                                        <th className='px-2 py-2 border border-gray-600'>Location</th>
                                        <th className='px-2 py-2 border border-gray-600'>Type</th>
                                        <th className='px-2 py-2 border border-gray-600'>Bill Rate</th>
                                        <th className='px-2 py-2 border border-gray-600'>Pay Rate</th>
                                        <th className='px-2 py-2 border border-gray-600'>Loaded Rate</th>
                                        <th className='px-2 py-2 border border-gray-600'>Billable</th>
                                        {
                                            runSheetTableMonthHeaders.map((runsheetHeaders, iH) => (
                                                <th className='px-2 py-2 border font-semibold whitespace-nowrap border-gray-600' key={"TableMonthHeader-" + iH}>{runsheetHeaders}</th>
                                            ))
                                        }
                                        <th className='px-2 py-2 border border-gray-600'>Total Revenue</th>
                                        <th className='px-2 py-2 border border-gray-600'>Total Cost</th>
                                        <th className='px-2 py-2 border bg-blue-600 text-white border-gray-600'>TotalRevenue(YTD)</th>
                                        <th className='px-2 py-2 border bg-blue-600 text-white border-gray-600'>TotalRevenue(YTD+Project)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-600 bg-Black">
                                    {
                                        listloadrunsheet.map((row, i) => (
                                            <tr key={"RunSHeetTR-" + i} className=' whitespace-nowrap'>
                                                <td className="p-2 border border-gray-600">{row.brspdMgr}</td>
                                                <td className="p-2 border border-gray-600">{row.program}</td>
                                                <td className="p-2 border border-gray-600">{row.status}</td>
                                                <td className="p-2 border border-gray-600">{row.name}</td>
                                                <td className="p-2 border border-gray-600">{row.roleaspersow}</td>
                                                <td className="p-2 border border-gray-600">{row.duration}</td>
                                                <td className="p-2 border border-gray-600 whitespace-nowrap">{convertDate(row.startdate)}</td>
                                                <td className="p-4 border border-gray-600 whitespace-nowrap">{convertDate(row.enddate)}</td>
                                                <td className="p-2 border border-gray-600">{row.location}</td>
                                                <td className="p-2 border border-gray-600">{row.type}</td>
                                                <td className="p-2 border border-gray-600">{row.billrate}</td>
                                                <td className="p-2 border border-gray-600">{row.payrate}</td>
                                                <td className="p-2 border border-gray-600">{row.loadedrate ? Number(row.loadedrate).toFixed(2) : '0.00'}</td>
                                                <td className="p-2 border border-gray-600">{row.billable}</td>
                                                {
                                                    row?.runsheet?.map((runsheetDataCh, iH) => (
                                                        <td className='px-2 py-2 border border-gray-600' key={"ch-" + iH}>
                                                            {runsheetDataCh?.isCurrentMonthActive ? <>
                                                                {
                                                                    runsheetDataCh?.currentMonth ?
                                                                        <input className='w-36 px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' type='number' value={runSheetPayload.find(a => a.GmId == row.gmId && a.month == runsheetDataCh?.month)?.hours || 0} onChange={(evt) => handleSaveRunSheetChange(evt, row.gmId, runsheetDataCh?.month)} />
                                                                        :
                                                                        runsheetDataCh?.hours
                                                                }</> : 0}
                                                        </td>
                                                    ))
                                                }
                                                {
                                                    row?.runsheet?.map((runsheetDataCost, iH) => (
                                                        <td className='px-2 py-2 border border-gray-600' key={"cost-" + iH}>{runsheetDataCost?.isCurrentMonthActive ? runsheetDataCost?.cost : 0}</td>
                                                    ))
                                                }
                                                {
                                                    row?.runsheet?.map((runsheetDataRh, iH) => (
                                                        <td className='px-2 py-2 border border-gray-600' key={"rh-" + iH}>
                                                            {runsheetDataRh?.isCurrentMonthActive ? <>
                                                                {
                                                                    runsheetDataRh?.currentMonth ?
                                                                        <input className='w-36 px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' type='number' value={runSheetPayload.find(a => a.GmId == row.gmId && a.month == runsheetDataRh?.month)?.hours || 0} onChange={(evt) => handleSaveRunSheetChange(evt, row.gmId, runsheetDataRh?.month)} />
                                                                        :
                                                                        runsheetDataRh?.hours
                                                                }</> : 0
                                                            }
                                                        </td>
                                                    ))
                                                }
                                                {
                                                    row?.runsheet?.map((runsheetDataRev, iH) => (
                                                        <td className='px-2 py-2 border border-gray-600' key={"rev-" + iH}>{runsheetDataRev?.isCurrentMonthActive ? runsheetDataRev?.hours : 0}</td>
                                                    ))
                                                }
                                                <td className="p-2 border border-gray-600">{row.totalcost}</td>
                                                <td className="p-2 border border-gray-600">{row.totalrevenue}</td>
                                                <td className="p-2 border border-gray-600">{row.totalrevenueytd}</td>
                                                <td className="p-2 border border-gray-600">{row.totalrevenueytdproject}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className='flex justify-end'>
                            <button className='bg-blue-600 text-white m-2 py-2 px-10 hover:bg-blue-800 rounded-xl text-[20px]' onClick={downloadExcel}>Export to Excel</button>
                            {isRunSheetSave &&
                                <button className='bg-green-600 text-white m-2 py-2 px-10 hover:bg-green-800 rounded-xl text-[20px]' onClick={handleSaveRunSheet}>Save RunSheet</button>
                            }
                        </div>
                    </>
                    }
                    {showRunSheet &&
                        <div className='flex justify-center'>
                            <button className='bg-red-600 text-white m-2 py-2 px-10 hover:bg-red-800 rounded-xl text-[20px]' onClick={() => setShowRunSheet(false)}>Close Runsheet</button>
                        </div>}
                </div>
            }
        </>
    )
}
export default OpenGM
