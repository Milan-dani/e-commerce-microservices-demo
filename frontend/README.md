# RTK Query + Redux Store (auto-generated)

This folder contains an auto-generated Redux Toolkit + RTK Query API layer based on a Postman collection.

What was generated
- `src/api/baseApi.js` - RTK Query base API with fetchBaseQuery and token header wiring
- `src/api/services/*` - RTK Query services for each Postman folder (Auth, Products, Cart, Orders, Payments, Inventory, Recommendations, Analytics)
- `src/store/slices/*` - Redux slices for auth, ui, products, cart, orders, payments, inventory, recommendations, analytics
- `src/store/index.js` - Configured Redux store wiring the API and slices

Quick start

1. Install deps:

```bash
npm install @reduxjs/toolkit react-redux
# or with yarn
yarn add @reduxjs/toolkit react-redux
```

2. Provide the store to your Next.js app (we added an example layout in `src/app/layout.js`).

3. Use the generated RTK Query hooks in components to call endpoints. See `src/app/demo-login/page.js` for an example login flow that stores the token into `auth` slice/localStorage.

Notes
- The base API uses `localStorage.getItem('token')` for Authorization headers. When using SSR routes, token access is guarded.
- Adjust endpoints if backend paths differ from the Postman collection.

If you'd like, I can also:
- Add unit tests for slices
- Add optimistic updates or more advanced cache invalidation strategies
# E-commerce Frontend Project

A modern, responsive e-commerce website built with Next.js, featuring a complete shopping experience with user authentication, product management, and admin dashboard.

## 🚀 Features

### Customer Features
- **Home Page**: Hero section, featured products, company features, and newsletter signup
- **Product Catalog**: Browse products with filtering, sorting, and search functionality
- **Shopping Cart**: Add/remove items, quantity management, and order summary
- **Checkout Process**: Multi-step checkout with shipping and payment information
- **User Dashboard**: Order history, wishlist, address management, and account settings
- **Authentication**: Login and signup with form validation
- **Responsive Design**: Mobile-first design that works on all devices

### Admin Features
- **Admin Dashboard**: Overview with statistics, recent orders, and analytics
- **Product Management**: Add, edit, delete, and manage product inventory
- **Order Management**: View and manage customer orders
- **Customer Management**: View customer information and order history
- **Analytics**: Sales reports and performance metrics

### Technical Features
- **Modern UI**: Built with Tailwind CSS and custom styling
- **Animations**: Smooth animations using Framer Motion
- **Responsive**: Mobile-first responsive design
- **Performance**: Optimized for fast loading and smooth interactions
- **Accessibility**: Built with accessibility best practices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS + Custom CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── admin-dashboard/   # Admin dashboard
│   ├── admin-products/    # Admin product management
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── contact/           # Contact page
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── orders/            # Order history
│   ├── products/          # Product catalog
│   ├── signup/            # Signup page
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
└── components/            # Reusable components
    ├── Footer.js          # Site footer
    └── Navigation.js      # Site navigation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ts-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Pages Overview

### Public Pages
- **Home** (`/`) - Landing page with hero, features, and featured products
- **Products** (`/products`) - Product catalog with filtering and search
- **About** (`/about`) - Company information and team
- **Contact** (`/contact`) - Contact form and information

### Authentication
- **Login** (`/login`) - User login with email/password
- **Signup** (`/signup`) - User registration with form validation

### Customer Pages
- **Cart** (`/cart`) - Shopping cart with item management
- **Checkout** (`/checkout`) - Multi-step checkout process
- **Dashboard** (`/dashboard`) - User account dashboard
- **Orders** (`/orders`) - Order history and tracking

### Admin Pages
- **Admin Dashboard** (`/admin-dashboard`) - Admin overview and statistics
- **Admin Products** (`/admin-products`) - Product management interface

## 🎨 Design Features

- **Modern UI**: Clean, professional design with consistent spacing and typography
- **Color Scheme**: Blue and purple gradient theme with proper contrast
- **Animations**: Smooth hover effects, page transitions, and micro-interactions
- **Responsive**: Mobile-first design that adapts to all screen sizes
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support

## 🔧 Customization

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind configuration in `tailwind.config.js`
- Customize component styles in individual component files

### Content
- Update company information in the About page
- Modify product data in the Products page
- Customize contact information in the Contact page

### Features
- Add new pages by creating folders in the `src/app` directory
- Create reusable components in the `src/components` directory
- Implement backend integration for dynamic data

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 Key Features Implemented

### User Experience
- ✅ Responsive navigation with mobile menu
- ✅ Product filtering and search
- ✅ Shopping cart functionality
- ✅ Multi-step checkout process
- ✅ User dashboard with order history
- ✅ Wishlist management
- ✅ Form validation and error handling

### Admin Experience
- ✅ Admin dashboard with statistics
- ✅ Product management (CRUD operations)
- ✅ Order management interface
- ✅ Customer management
- ✅ Analytics and reporting

### Technical Implementation
- ✅ Next.js App Router
- ✅ Tailwind CSS styling
- ✅ Framer Motion animations
- ✅ Responsive design
- ✅ Component-based architecture
- ✅ Clean code structure

## 🚀 Next Steps

To make this a fully functional e-commerce site, consider adding:

1. **Backend Integration**: Connect to a backend API for dynamic data
2. **Authentication**: Implement real user authentication
3. **Payment Processing**: Integrate with payment gateways
4. **Database**: Add database for products, orders, and users
5. **Image Upload**: Implement image upload for products
6. **Email Notifications**: Add email notifications for orders
7. **SEO Optimization**: Add meta tags and SEO optimization
8. **Testing**: Add unit and integration tests
9. **Performance**: Implement caching and performance optimizations
10. **Deployment**: Deploy to a hosting platform

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@micromerce.com or create an issue in the repository.