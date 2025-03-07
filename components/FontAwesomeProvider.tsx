'use client';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faComment, faCamera, faMagnifyingGlass, faEllipsisVertical,
  faPen, faRotateRight, faPaperclip, faFaceSmile, faPaperPlane,
  faHouse
} from '@fortawesome/free-solid-svg-icons';

// Prevent automatic CSS injection
config.autoAddCss = false;

// Add icons to the library
library.add(
  faComment, faCamera, faMagnifyingGlass, faEllipsisVertical, 
  faPen, faRotateRight, faPaperclip, faFaceSmile, faPaperPlane,
  faHouse
);

export default function FontAwesomeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}