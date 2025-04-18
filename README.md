# skylander-inventory-tracker
# Skylander Inventory Tracker

A comprehensive web application for tracking, managing, and sharing your Skylander collection. This tool helps collectors organize their figures, track values, create trade lists, and identify Skylanders using their device camera.

![Skylander Inventory Tracker Screenshot](public/assets/images/app-screenshot.png)

## 🎮 Features

- **Comprehensive Dashboard**: Filter, sort, and search your entire Skylander collection
- **Data Import**: Import Skylanders data from Google Sheets or CSV files
- **Auto-Pricing**: Fetch current market prices from SCL Collectibles
- **Camera Identification**: Identify Skylanders by taking a picture with your device
- **Trade Management**: Create and share lists of Skylanders available for trade
- **Collection Sharing**: Generate custom shareable views of your collection
- **Inventory Tracking**: Track quantities, values, wishlist items, and more
- **Detailed Skylander Views**: Add notes and track condition, variants, etc.

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

## 🚀 Getting Started

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/skylander-inventory-tracker.git
cd skylander-inventory-tracker
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file (use `.env.example` as a template)
```bash
cp .env.example .env.local
# Edit .env.local to add your environment variables
```

4. Start the development server
```bash
npm start
```

5. Open your browser and navigate to http://localhost:3000

## 📂 Project Structure

```
skylander-inventory-tracker/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components
│   │   ├── dashboard/     # Dashboard-specific components
│   │   ├── import/        # Import-related components
│   │   ├── detail/        # Skylander detail components
│   │   ├── scan/          # Camera scanning components
│   │   ├── trade/         # Trade management components
│   │   └── share/         # Collection sharing components
│   ├── context/           # React context for state management
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and external services
│   ├── utils/             # Helper functions
│   ├── App.js             # Main app component
│   └── index.js           # Entry point
└── package.json           # Dependencies and scripts
```

## 🛠️ Usage Guide

### Importing Skylander Data

1. **Prepare your data source:**
   - Create a Google Sheet with columns: name, element, category, imageUrl (optional), link (optional)
   - Make sure your sheet is publicly accessible or shared with anyone with the link

2. **Import process:**
   - Navigate to the "Import Data" page
   - Paste your Google Sheet URL or upload a CSV file
   - Enable "Auto-populate prices" if desired
   - Review the data preview and confirm the import

### Managing Your Collection

- **Dashboard:** Use filters and search to find specific Skylanders
- **Inventory management:** Mark Skylanders as "Have" or "Need"
- **Value tracking:** Set quantity and value for each Skylander
- **Details page:** Click any Skylander name to see and edit detailed information

### Scanning Skylanders

1. Navigate to the "Scan" page
2. Position your Skylander figure in front of your device camera
3. Click "Capture" to take a photo
4. Confirm the identified Skylander to add it to your collection

### Trading and Sharing

- **Trade view:** Manage which Skylanders you want to trade
- **Share view:** Create custom collection views to share with other collectors
- **Save views:** Save different collection configurations for future use

## 🧰 Technical Implementation

The application uses the following technologies:

- **React:** Frontend framework
- **React Bootstrap:** UI components
- **React Router:** Navigation
- **React Context:** State management
- **PapaParse:** CSV parsing
- **React Webcam:** Camera functionality

Local storage is used to persist data between sessions. For production use, consider implementing Firebase or another backend solution.

## 📱 Deployment

### Building for Production

```bash
npm run build
```

### Deployment to Cloudflare Pages

1. Push your repository to GitHub
2. Connect your repository to Cloudflare Pages
3. Configure the build settings:
   - Build command: `npm run build`
   - Build output directory: `build`
4. Deploy!

## 🔮 Future Enhancements

- User authentication system
- Cloud database integration
- Price history tracking
- Community trading marketplace
- Image recognition AI for more accurate Skylander identification
- Mobile app version

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [SCL Collectibles](https://sclcollectibles.com/) for pricing data
- [Skylanders Character List](https://skylanderscharacterlist.com/) for reference information
- All Skylanders collectors and enthusiasts
