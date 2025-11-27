import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { apiClient } from './api'
import { 
  loggingRequestInterceptor, 
  errorResponseInterceptor,
  loggingResponseInterceptor 
} from './api/interceptors'

// Setup API client interceptors
if (import.meta.env.DEV) {
  apiClient.addRequestInterceptor(loggingRequestInterceptor);
  apiClient.addResponseInterceptor(loggingResponseInterceptor);
}

// Always add error interceptor for auth handling
apiClient.addResponseInterceptor(errorResponseInterceptor);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
