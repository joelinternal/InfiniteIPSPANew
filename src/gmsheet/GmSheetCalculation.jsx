import React, { useEffect, useState } from 'react'
import axios from 'axios';

const GmSheetCalculation = ({ accountId, projectId, refreshGmSheetCalc }) => {
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


    const getRevenue = () => {
        axios.get(`http://localhost:5071/api/GM/RevenueDetails/${accountId}/${projectId}`).then(res => {
            setlstRevenueOnshore(res.data?.onshore)
            setlstRevenueOffshore(res.data?.offshore)
        })
    }

    useEffect(() => {
        if (projectId > 0 && accountId > 0)
            getRevenue();
    },[refreshGmSheetCalc])

    return (
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
                        <td className="border border-black px-4 py-2 text-center">{lstRevenueOnshore?.monthcount} Months</td>
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
    )
}

export default GmSheetCalculation