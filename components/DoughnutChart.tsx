'use client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({accounts}: DoughnutChartProps) => {
    const data = {
        datasets: [
            {
                label: 'Banks',
                data: [1250, 2500, 1000],
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