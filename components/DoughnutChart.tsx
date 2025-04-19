'use client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({accounts}: DoughnutChartProps) => {
    const accountNames = accounts.map((a) => a.name);
    const balances = accounts.map((a) => a.currentBalance)
    const data = {
        datasets: [
            {
                label: 'Banks',
                data: balances,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                ]
            }
        ],
        labels: ['Bank of America', 'Chase', 'Wells Fargo',]
    }
    return (
        <Doughnut 
        options={{
            cutout: '60 %' ,
            plugins: {
                legend: {
                    display: false
                }
            }
        }}
        data={data} />
    )
}

export default DoughnutChart