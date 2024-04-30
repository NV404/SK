import { Loader2 } from "lucide-react"
import { useState } from "react"
import Markdown from "react-markdown"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

const ChatbotButton = ({ apiKey }: { apiKey: string }) => {
  const [showChatbot, setShowChatbot] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `You are a software suggest bot, which provides answers realted to software and details about softwares mainly saas platforms.
        You name is Siya - Software Intelligence Yield Advisor. Software Intelligence: This refers to the capability of the advisor to gather, analyze, and comprehend information related to software products. It involves understanding the features, functionalities, pricing, user reviews, and industry trends associated with various software options.

        Yield: In this context, "yield" might imply the outcome or result achieved through the advisor's recommendations and guidance. It could signify the successful selection or acquisition of software that meets the user's requirements and expectations.
        
        Advisor: Indicates the role of the AI in providing advice, suggestions, and recommendations to users regarding their software-buying decisions. The advisor leverages its intelligence and knowledge to offer personalized guidance tailored to the user's needs and preferences.
        
        Overall, "Software Intelligence Yield Advisor" suggests an AI assistant specialized in providing intelligent guidance and recommendations for selecting software products, with a focus on achieving favorable outcomes for the user.
        
        If anyone ask you unrelated question other then saas just say you can't help in this topic. reply in markdown`,
    },
  ])

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot)
  }

  //   const openaiKey = process.env.OPEN_AI_KEY

  const GetResult = async () => {
    setLoading(true)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [...messages, { role: "user", content: inputValue }],
        temperature: 0.7,
      }),
    })

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: inputValue },
    ])

    if (!response.ok) {
      throw new Error(
        "Oops! Something went wrong while processing your request.",
      )
    }

    const responseData = await response.json()
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: responseData.choices[0].message.content,
      },
    ])
    setInputValue("")
    setLoading(false)
  }

  return (
    <div>
      <button
        className="fixed bottom-5 right-5 z-50 rounded-full bg-blue-500 p-3 text-white shadow-lg"
        onClick={toggleChatbot}
      >
        Chatbot
      </button>

      {showChatbot && (
        <div className="fixed bottom-20 right-5 z-50 w-full max-w-sm overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex h-[60vh] flex-col">
            <div className="flex-1 bg-gray-100 p-6 dark:bg-gray-900">
              <div className="flex flex-grow flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <img
                    alt="Siya"
                    className="rounded-full"
                    height={40}
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    style={{
                      aspectRatio: "40/40",
                      objectFit: "cover",
                    }}
                    width={40}
                  />
                  <p className="font-semibold">Siya</p>
                  {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                    10:30am
                  </p> */}
                </div>
                <div className="flex max-h-[40vh] flex-grow flex-col gap-2 overflow-y-scroll">
                  <div className="h-fit rounded-md bg-white p-2">
                    <p className="text-right">
                      Hi there! I'm Siya, your friendly chatbot. How can I help
                      you today?
                    </p>
                  </div>
                  {messages.map((messgae: any) => {
                    if (messgae.role === "user") {
                      return (
                        <div className="h-fit rounded-md bg-white p-2">
                          <p className="text-right">{messgae.content}</p>
                        </div>
                      )
                    }
                    if (messgae.role === "assistant") {
                      return (
                        <div className="prose h-fit rounded-md bg-blue-100 p-2 text-left">
                          <Markdown>{messgae.content}</Markdown>
                        </div>
                      )
                    }
                  })}
                  {isLoading ? (
                    <div className="flex h-fit items-center gap-2 rounded-md bg-blue-100 p-2">
                      <p className="text-left">Loading ...</p>
                      <Loader2 className="animate-spin" size={12} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <Input
                className="flex-1"
                placeholder="Type a message"
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
              />
              <Button onClick={GetResult}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatbotButton
