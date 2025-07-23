import axios from 'axios';

const API_URL = 'http://20.244.56.144/evaluation-service/logs';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ2dmNlMjJjc2UwMTgxQHZ2Y2UuYWMuaW4iLCJleHAiOjE3NTMyNTExNjksImlhdCI6MTc1MzI1MDI2OSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImZmNGNkNzJjLTRkMmItNDk2Mi1iMzc2LTI0NzA1N2E4ZDg2ZSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InRlanVzIHMiLCJzdWIiOiI3ZGY4MmQ0ZS0xOTZjLTQwNzgtYWNlNC1jZmY3NDY4YTYxM2QifSwiZW1haWwiOiJ2dmNlMjJjc2UwMTgxQHZ2Y2UuYWMuaW4iLCJuYW1lIjoidGVqdXMgcyIsInJvbGxObyI6IjR2djIyY3MxNjgiLCJhY2Nlc3NDb2RlIjoidHFUU3BEIiwiY2xpZW50SUQiOiI3ZGY4MmQ0ZS0xOTZjLTQwNzgtYWNlNC1jZmY3NDY4YTYxM2QiLCJjbGllbnRTZWNyZXQiOiJlZ3hqZVhLYXpWa0hmRW5rIn0.gQFvt1S9oeHMOMoO3xRdOEM-kX0VLfoI1BxazRLW8cc';

export async function Log(stack, level, pkg, message) {
  try {
    const response = await axios.post(API_URL, {
      stack: stack,
      level: level,
      package: pkg,
      message: message
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Log sent:', response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return;
    }
    console.error('Logger error:', error.message);
  }
}

export default Log;
