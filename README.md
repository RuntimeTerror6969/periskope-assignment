---

# Chat Application - Hiring Assignment

Welcome to my Chat Application project, developed as part of a hiring assignment. This project showcases a real-time messaging platform with a responsive UI, user authentication, and message management, built using modern web technologies. The goal was to demonstrate my skills in React, TypeScript, Supabase, Tailwind CSS, and software design principles.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Challenges and Solutions](#challenges-and-solutions)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview
This chat application allows users to:
- View a list of chats in a sidebar.
- Select a chat to view and send messages in a main chat area.
- Perform actions like searching messages, filtering chats, and signing out.
- Experience a responsive design that works on both desktop and mobile devices.

The project leverages Supabase for real-time database operations and authentication, Next.js for a robust React framework, and Tailwind CSS for a streamlined styling approach. This README serves as a guide for setting up, using, and understanding the project, while also reflecting my development process.

## Features
- **Real-Time Messaging**: Messages are fetched and updated in real-time using Supabase's PostgreSQL changes.
- **User Authentication**: Integration with Supabase for sign-out functionality.
- **Responsive Design**: Sidebar and chat area adapt to mobile and desktop views.
- **Chat Management**: Filter chats, search messages, and view unread message counts.
- **Custom UI**: Customizable input area with icons for emojis, attachments, and more, inspired by modern chat apps like WhatsApp.
- **Message Grouping**: Messages are grouped by sender for better readability.

## Tech Stack
- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL, Realtime, Authentication)
- **Icons**: Font Awesome
- **Image Handling**: Next.js `Image` component
- **Version Control**: Git, GitHub

## Installation
To run this project locally, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/RuntimeTerror6969/periskope-assignment.git
   cd periskope-assignment
   ```

2. **Install Dependencies**
   Ensure you have Node.js (v14 or later) installed. Then run:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file in the root directory and add the following, replacing the placeholders with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   - Obtain these from your Supabase project dashboard.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Usage
- **Sign In**: The app assumes a logged-in user (`currentUser`) is passed as a prop. For testing, simulate this with a mock user object or integrate a full authentication flow.
- **Sidebar**: 
  - Navigate chats using the left sidebar.
  - Click the settings icon (`faCog`) to access the sign-out option.
  - Use the search and filter buttons to manage chats.
- **Main Chat Area**: 
  - Select a chat to view messages.
  - Type and send messages using the input area.
  - Use icons for emojis, attachments, clock, history, documents, and microphone (functionality TBD).
- **Mobile View**: Toggle the navigation menu and use the back button to return to the chat list.

## Design Decisions
- **Real-Time Updates**: Used Supabase's Realtime subscriptions to update chats and messages instantly, enhancing user experience.
- **Responsive Layout**: Implemented a mobile-first approach with Tailwind CSS, using `hidden` and `flex` utilities for sidebar toggling.
- **Icon-Based Input**: Replaced default icons with custom ones (e.g., paperclip, clock) to align with modern chat app designs, with plans for future functionality.
- **Borderless Design**: Removed black borders from the sidebar for a cleaner, modern aesthetic, relying on background colors and padding for separation.
- **Send Button Styling**: Switched to a white button with a green triangle  to differentiate from Telegram's paper plane, inspired by WhatsApp.

## Challenges and Solutions
1. **Spacing Issues in MainChatArea**:
   - **Challenge**: The logo and text spacing in the input area was disproportionate with a larger logo size.
   - **Solution**: Adjusted margins (e.g., `mr-1.5` to `mr-2`) and tested with custom pixel values (`style={{ marginRight: '2px' }}`) to achieve balance.
2. **Real-Time Sync**:
   - **Challenge**: Ensuring messages sync correctly across users.
   - **Solution**: Used Supabase channels with specific event listeners (`INSERT`) and sorted messages by timestamp.
3. **Icon Customization**:
   - **Challenge**: Replacing the send icon to avoid Telegram resemblance.
   - **Solution**: Used `faPlay` for a left-pointing green triangle on a white button, aligning with the WhatsApp style.

## Future Improvements
- **Authentication Flow**: Add full login/signup pages using Supabase Auth UI.
- **Attachment Upload**: Implement file upload functionality for the paperclip icon using Supabase Storage.
- **History Feature**: Develop a message history view for the `faHistory` icon.
- **Notifications**: Integrate push notifications for new messages.
- **Unit Tests**: Add Jest and React Testing Library for component testing.
- **Performance**: Optimize message loading for large chat histories with pagination.

## Contributing
This project is part of a hiring assignment and is not open for public contributions. However, I welcome feedback! If you’re a recruiter or evaluator, feel free to suggest improvements or discuss the codebase with me.

## License
This project is for demonstration purposes only and is not licensed for public use. All rights reserved.

## Contact
- **GitHub**: [RuntimeTerror6969](https://github.com/RuntimeTerror6969)
- **Email**: [aadarsh.22.2003@gmail.com]
- **LinkedIn**: [https://www.linkedin.com/in/aadarsh-397461227/](https://www.linkedin.com/in/aadarsh-397461227/)

Thank you for reviewing my work! I’m excited to discuss this project further and demonstrate my skills in action.

---
