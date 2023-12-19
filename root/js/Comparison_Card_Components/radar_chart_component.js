export const RadarChartComponent = {
    template: `
      <canvas id="radar_chart"></canvas>`,
    data() {
        return {
            radarChart: null
        }
    },
    props: {
        data1: Object,
        maxTempo: Number
    },
    computed: {
        radarData1() {
            if (this.data1 === undefined) {
                return [0, 0, 0, 0, 0]
            }
            return [this.data1.Danceability, this.data1.Energy, this.data1.Valence, (parseFloat(this.data1.Tempo) / this.maxTempo), this.loudnessMap(parseFloat(this.data1.Loudness))]
        }
    },
    mounted() {
        this.createChart()

    },
    methods: {
        createChart() {
            // Configuration options for the radar chart
            const options = {
                scale: {
                    angleLines: {
                        display: true,
                    },
                    pointLabels: {
                        font: {
                            size: 24
                        },
                        color: 'blue',
                    },
                    r: {
                        ticks: {
                            beginAtZero: true,
                            stepSize: 0.2,
                            backdropColor: '#D9D6D2'
                        },
                        min: 0,
                        max: 1
                    },
                    font: {
                        size: 12
                    },
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                responsive: true
            };

            // Get the canvas element and create the radar chart
            const ctx = document.getElementById('radar_chart').getContext('2d');
            const radarChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Danceability', 'Energy', 'Valence', 'Tempo', 'Loudness'],
                    datasets: [{
                        label: this.data1?.Track,
                        backgroundColor: ' rgba(194, 160, 217, 0.2)', //color of border with 0.2 opacity
                        borderColor: '#C2A0D9',
                        borderWidth: 2,
                        data: this.radarData1
                    }]
                },
                options: options
            });

            Object.seal(radarChart);
            this.radarChart = radarChart;
        },
        updateChart() {
            if (this.radarChart) {
                this.radarChart.data.datasets[0].data = this.radarData1
                this.radarChart.data.datasets[0].label = this.data1.isSong ? this.data1.Track : this.data1.Artist

                this.radarChart.update()
            }
        },
        loudnessMap(loudness) {
            return (loudness + 60) / 60
        }
    },
    watch: {
        data1: {
            handler: 'updateChart'
        }
    }
}