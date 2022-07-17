class ChartsInit {
    #chartsConfig;
    #allowedCharts = [
        'bar', 'bubble', 'pie', 'line', 'polar', 'radar', 'scatter'
    ];
    #charts = {};

    constructor(chartsConfig){
        chartsConfig.forEach((v) => {
            if(!this.#allowedCharts.includes(v.type)){
                throw new Error('Invalid chart type "' + v.type + '"');
            }
        });
    
        this.#chartsConfig = chartsConfig;
    }

    init(){
        this.#chartsConfig.forEach((v) => {
            let name = v.name ? v.name : 'unnamed';
            this.#charts[name] = new ChartUI(v);
        });
    }

    getChart(name){
        return this.#charts[name];
    }

    // addChart()
}

class ChartUI {

    #domElement;
    #type;
    #datasets;
    #labels = [];
    #chart;

    #config = {};
    #options = {
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                titleFont: {
                    size: 11
                },
                bodyFont: {
                    size: 9
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 8
                    }
                },
                grid: {
                    display: false
                }
            },
            y:{
                ticks: {
                    font: {
                        size: 8
                    }
                },
                grid: {
                    display: false
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    constructor(data){
        this.#validate(data);

        if(data.labels) this.#labels = data.labels;
        this.#domElement = data.domElement;
        this.#type = data.type;
        this.#datasets = data.datasets;
        
        this.#defineConfigs();
        this.#analyzer();

        if(data.filters) this.#defineFilters(data.filters);

        this.#chart = new Chart(this.#domElement, this.#config);
    }

    #defineConfigs() {
        this.#config = {
            type: this.#type,
            data: {
                labels: this.#labels,
                datasets: this.#datasets
            },
            options: this.#options
        };
    }

    #defineFilters(filters) {
        filters.forEach(elem => {
            if(elem.returnDefault === true) {
                elem.domElement.addEventListener('click', this.#returnDefault.bind(this));
            }

            elem.domElement.addEventListener('click', this.#useFilter.bind(this, elem));
        });
    }

    #useFilter(filter){
        let datasets = structuredClone(this.#datasets);
        for (let i = 0; i < filter.datasets.length; i++) {
            datasets[i].data = filter.datasets[i].data;
        }
        this.#config.data = {
            datasets: datasets,
            labels: filter.labels
        };
        this.reRender();
    }

    #returnDefault() {
        this.#defineConfigs();
        this.reRender();
    }

    #analyzer(){
        switch(this.#type){
            case 'pie':
                this.#pieAnalyzer();
                break;
            case 'bar':
                this.#barAnalyzer();
                break;
        }
        
    }

    #pieAnalyzer(){
        this.#options.scales.x.display = false;
        this.#options.scales.y.display = false;
        this.#options.plugins.legend = {
            display: true,
            position: 'right',
            labels: {
                font: {
                    size: 10
                },
                boxWidth: 10
            }
        };    
    }

    #barAnalyzer(){
        this.#options.scales.y.grid = {
            color: (ctx) => (ctx.tick.value === 0 ? 'rgba(0, 0, 0, 0.1)' : 'transparent')
        };
    }

    #validate(data){
        if(data.domElement === undefined || data.domElement === null){
            throw new Error('Dom Element must be defined.');
        }
    }

    reRender(){
        this.#chart.destroy();
        this.#chart = new Chart(this.#domElement, this.#config);
    }


}