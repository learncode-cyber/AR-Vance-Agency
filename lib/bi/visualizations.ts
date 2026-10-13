export class VisualizationLibrary {
  // Chart configurations
  static lineChart(data: any[], xField: string, yField: string) {
    return {
      type: 'line',
      data,
      xAxis: { dataKey: xField },
      yAxis: {},
      line: { dataKey: yField, stroke: '#8884d8' },
    };
  }

  static barChart(data: any[], xField: string, yFields: string[]) {
    return {
      type: 'bar',
      data,
      xAxis: { dataKey: xField },
      yAxis: {},
      bars: yFields.map((field, i) => ({
        dataKey: field,
        fill: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'][i],
      })),
    };
  }

  static pieChart(data: any[], nameField: string, valueField: string) {
    return {
      type: 'pie',
      data,
      nameKey: nameField,
      dataKey: valueField,
      colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
    };
  }

  static areaChart(data: any[], xField: string, yFields: string[]) {
    return {
      type: 'area',
      data,
      xAxis: { dataKey: xField },
      yAxis: {},
      areas: yFields.map((field, i) => ({
        dataKey: field,
        fill: ['#8884d8', '#82ca9d', '#ffc658'][i],
        stroke: ['#1f77b4', '#2ca02c', '#ff7f0e'][i],
      })),
    };
  }

  static scatterChart(data: any[], xField: string, yField: string) {
    return {
      type: 'scatter',
      data,
      xAxis: { dataKey: xField, type: 'number' },
      yAxis: { dataKey: yField, type: 'number' },
      scatter: { dataKey: yField },
    };
  }

  static heatmapChart(data: any[][]) {
    return {
      type: 'heatmap',
      data,
      colors: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
    };
  }

  // KPI cards
  static kpiCard(title: string, value: number | string, change?: number, color?: string) {
    return {
      type: 'kpi',
      title,
      value,
      change,
      color: color || '#0088FE',
    };
  }

  // Gauge chart
  static gaugeChart(value: number, max: number = 100) {
    return {
      type: 'gauge',
      value,
      max,
      color: value > 75 ? '#00C49F' : value > 50 ? '#FFBB28' : '#FF8042',
    };
  }

  // Table visualization
  static table(data: any[], columns: Array<{ key: string; label: string }>) {
    return {
      type: 'table',
      data,
      columns,
      pagination: { pageSize: 10 },
      sorting: true,
      filtering: true,
    };
  }
}
