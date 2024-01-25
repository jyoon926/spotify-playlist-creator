import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OpenAI } from "openai";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {
  
  constructor(private http: HttpClient) { }
  
  async completion(prompt: string) {
    const openai = new OpenAI({ apiKey: environment.OPENAI_API_KEY, dangerouslyAllowBrowser: true });
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { "role": "system", "content": "You are a simple but creative answering bot." },
        { "role": "user", "content": prompt }
      ]
    }).finally();
    return completion.choices[0].message.content;
  }
}
