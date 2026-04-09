# Table Tennis Performance Dashboard

A sleek, interactive dashboard designed for table tennis players and coaches to visualize and analyze performance metrics through intuitive charts and graphs.

## 📊 Project Description

The Table Tennis Performance Dashboard is a web-based application that transforms raw table tennis performance data into actionable insights. With clean visualizations including pie charts and bar graphs, users can quickly analyze serve types, stroke patterns, and focus areas to improve their game strategy and training focus.

## ✨ Features

### Core Features
- **Serve Type Analysis**: Pie chart visualization showing distribution of serve types (Pendulum, Chop, Tomahawk, Forehand)
- **Stroke Analysis**: Bar graph displaying performance metrics for key strokes (Backhand loop, Forehand loop, Backhand Serve, Forehand Serve)
- **Focus Analysis**: Pie chart illustrating focus distribution between Right and Left sides
- **Structured Dashboard Layout**: Clean, organized presentation of table tennis statistics
- **Basic Data Input**: Simple interface for entering and uploading performance metrics

### Additional Features
- Interactive chart elements with hover effects
- Responsive design for optimal viewing on different devices
- Multiple pages for comprehensive data management

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Charts**: Custom JavaScript charting implementation
- **No external dependencies** - runs entirely in modern browsers

## 🚀 Setup Instructions

1. Download or clone the project files to your local machine
2. Navigate to the project directory
3. Open `index.html` in your web browser
4. No additional installation or server setup required

## 📖 Usage Guide

### Dashboard Overview
The main dashboard (`dashboard.html`) presents three key visualizations:
- **Top-left**: Serve Type Pie Chart - Shows percentage distribution of different serve types
- **Top-right**: Focus Analysis Pie Chart - Displays right vs left side focus percentages
- **Bottom**: Stroke Analysis Bar Graph - Compares performance across different stroke types

### Navigation
- **Dashboard**: Main analytics overview
- **Data Input**: Enter new performance data
- **Data Management**: View and manage existing data sets
- **Detailed Analysis**: Deep dive into specific metrics
- **Settings**: Configure application preferences

### Interacting with Charts
- Hover over chart segments to view exact percentages and counts
- Click on legend items to toggle visibility of specific data series
- Charts automatically adjust based on screen size

## 📁 File Structure

```
project/
├── css/
│   └── style.css              # Main stylesheet
├── js/
│   ├── main.js                # Core application logic
│   ├── dashboard.js           # Dashboard-specific functionality
│   ├── data_input.js          # Data input handling
│   ├── data_management.js     # Data management operations
│   ├── detailed_analysis.js   # Advanced analytics
│   ├── settings.js            # Settings configuration
│   ├── charts.js              # Chart rendering utilities
│   └── utils.js               # Helper functions
├── index.html                 # Landing page
├── dashboard.html             # Main dashboard
├── data_input.html            # Data entry page
├── data_management.html       # Data management page
├── detailed_analysis.html     # Detailed analysis page
└── settings.html              # Settings page
```

## 🎯 Target Audience

- **Table Tennis Players**: Track personal performance and identify areas for improvement
- **Coaches**: Analyze player data to develop targeted training programs
- **Training Facilities**: Monitor multiple players' progress and performance trends

## 🔮 Future Enhancements

- **Interactive Charts**: Enhanced interactivity with drill-down capabilities
- **Data Filtering**: Filter data by date ranges, player, or match type
- **Export Functionality**: Export charts and data to PDF/CSV formats
- **Advanced Responsive Design**: Optimized experience for mobile devices
- **Data Persistence**: Local storage or database integration
- **Player Comparison**: Side-by-side comparison of multiple players

## 🤝 Contributing

We welcome contributions to enhance the Table Tennis Performance Dashboard! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate comments.

## 📄 License

This project is currently unlicensed. Please contact the project maintainers for usage permissions.

---

*Built for table tennis enthusiasts by performance analytics enthusiasts.*