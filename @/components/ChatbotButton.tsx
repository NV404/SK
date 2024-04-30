import { Loader2, SendHorizonalIcon } from "lucide-react"
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
        Your name is Siya - Software Intelligence Yield Advisor. Software Intelligence: This refers to the capability of the advisor to gather, analyze, and comprehend information related to software products. It involves understanding and providing the features, functionalities, pricing, user reviews, and industry trends associated with various software options.
        Advisor: Indicates the role of the AI in providing advice, suggestions, and recommendations to users regarding their software-buying decisions. The advisor leverages its intelligence and knowledge to offer personalized guidance tailored to the user's needs and preferences.
        Overall, "Software Intelligence Yield Advisor" suggests an AI assistant specialized in providing intelligent guidance and recommendations for selecting software products, with a focus on achieving favorable outcomes for the user.
        If anyone ask you unrelated question other then softwares/companies/saas/top list of products, just say you can't help in this topic. reply in markdown only.`,
    },
  ])

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot)
  }

  //   const openaiKey = process.env.OPEN_AI_KEY

  const GetResult = async () => {
    setLoading(true)
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: inputValue },
    ])

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

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      GetResult()
    }
  }

  return (
    <div>
      <button
        className="fixed right-0 top-1/2 z-50 -translate-y-1/2 rounded-l-full bg-blue-500 p-3 text-white shadow-lg"
        onClick={toggleChatbot}
      >
        Chatbot
      </button>

      {showChatbot && (
        <div className="absolute left-0 top-0 h-screen w-screen">
          <div
            className="absolute left-0 top-0 h-screen w-screen"
            onClick={() => setShowChatbot(false)}
          ></div>
          <div className="fixed right-0 top-0 z-50 w-[50vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800">
            <div className="flex h-screen flex-col">
              <div className="flex-1 p-6 dark:bg-gray-900">
                <div className="flex flex-grow flex-col gap-2">
                  <div className="flex items-center space-x-2 border-b-2 border-black/5 pb-2">
                    <img
                      alt="Siya"
                      className="rounded-full"
                      height={30}
                      src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      style={{
                        aspectRatio: "40/40",
                        objectFit: "cover",
                      }}
                      width={30}
                    />
                    <p className="font-semibold">Siya</p>
                    {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                    10:30am
                  </p> */}
                  </div>
                  <div className="flex max-h-[75vh] flex-grow flex-col gap-2 overflow-y-scroll">
                    <div className="flex gap-2">
                      <div>
                        <img
                          alt="Siya"
                          className="mt-2 rounded-full"
                          height={30}
                          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          style={{
                            aspectRatio: "40/40",
                            objectFit: "cover",
                          }}
                          width={30}
                        />
                      </div>
                      <div className="h-fit max-w-[80%] rounded-md bg-blue-100 bg-muted p-3 text-left">
                        Hi there! I'm Siya, your friendly chatbot. How can I
                        help you today?
                      </div>
                    </div>
                    {messages.map((messgae: any) => {
                      if (messgae.role === "user") {
                        return (
                          <div className="h-fit max-w-[70%] self-end rounded-md bg-blue-400 p-2 text-white">
                            <p className="text-right">{messgae.content}</p>
                          </div>
                        )
                      }
                      if (messgae.role === "assistant") {
                        return (
                          <div className="flex gap-2">
                            <div>
                              <img
                                alt="Siya"
                                className="mt-2 rounded-full"
                                height={30}
                                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                style={{
                                  aspectRatio: "40/40",
                                  objectFit: "cover",
                                }}
                                width={30}
                              />
                            </div>
                            <div className="prose h-fit max-w-[80%] rounded-md bg-blue-100 bg-muted p-3 text-left">
                              <Markdown>{messgae.content}</Markdown>
                            </div>
                          </div>
                        )
                      }
                    })}
                    {isLoading ? (
                      <div className="flex gap-2">
                        <div>
                          <img
                            alt="Siya"
                            className=" rounded-full"
                            height={30}
                            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            style={{
                              aspectRatio: "40/40",
                              objectFit: "cover",
                            }}
                            width={30}
                          />
                        </div>
                        <div className=" h-fit max-w-[80%] rounded-md bg-blue-100 bg-muted text-left">
                          <div className="flex h-fit items-center gap-2 rounded-md bg-muted p-2">
                            <p className="text-left">Loading ...</p>
                            <Loader2 className="animate-spin" size={12} />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 pt-0">
                <Input
                  className="flex-1"
                  placeholder="Type a message"
                  value={inputValue}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                />
                <Button
                  onClick={GetResult}
                  variant={"outline"}
                  className="rounded-full text-blue-400"
                >
                  <SendHorizonalIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatbotButton
