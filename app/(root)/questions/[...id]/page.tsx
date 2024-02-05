"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import CodeEditor from "@/components/shared/editor";
import { useState } from "react";
import TestcaseDetails from "@/components/shared/testcaseDetails";
import ProblemDescription from "@/components/shared/problemDescription";
import { useToast } from "@/components/ui/use-toast";
import { problems } from "@/lib";
import  Header  from "@/components/shared/Header";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowBigLeftIcon } from "lucide-react";




export default function QuestionSubmission({ params }: {
  params: {
  id: string
}}) {

     const [uploadOutputText, setUploadOutputText] = useState("");
  // const problemDetails = problems[id]; 
    const problemInfo = problems[params.id]
  const [code, setCode] = useState("");
  const { toast } = useToast();
const [language, setLanguage] = useState("python");

 const [output, setOutput] = useState(null);
 const [isLoading, setIsLoading] = useState(false);
 const [isError, setIsError] = useState(false);
  const [correct, setCorrect] = useState(0); 
  

   const handleTextareaChange = (event: any) => {
     setUploadOutputText(event.target.value);
   };
  
 const runCode = async () => {
   console.log("clicked");
   if (!code) return;
   try {
     const url = "/api/execute"
     const data = { 
       language: language, 
        code: code
     }
     setIsLoading(true);
     
     const options: RequestInit = {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(data),
     };

     fetch(url, options)
       .then((response) => {
         if (!response.ok) {
           throw new Error("Network response was not ok");
         }
         return response.json(); // Parse the JSON response
       })
       .then((data) => {
         // Handle the response data
         const { run: result } = data['data']; 
         console.log(result.output.split("\n")); 

         setOutput(result.output.split("\n"));





         
       if (result.stderr) {
         setIsError(true);
         toast({
           title: "An error occurred.",
           description: result.stderr.message || result.output.split("\n").slice(1) || "Unable to run code",
           variant: "destructive",
           duration: 6000,
         });
       } else {
         setIsError(false);
         setCorrect(0);
         const res = result.output.split("\n");

         for (let index = 0; index < res.length; index++) {
           let answer = null;

           if (res !== null && isError === false) {
             if (res[index] !== "") {
               if (typeof res[index] === "string") {
                 answer = JSON.parse(res[index]);
               } else {
                 answer = res[index];
               }
             }
           }

           if (answer !== null) {
             if (
               JSON.stringify(answer) ===
               JSON.stringify(problemInfo.testCases[index].output)
             ) {
               setCorrect((prev) => prev + 1);
             }
           }
         }
       }
         
         
       })
       .catch((error) => {
         // Handle any errors that occur during the fetch request
         console.error("Fetch error:", error);
       });
   

   } catch (error: any) {
     console.log(error);
     toast({
       title: "An error occurred.",
       description: error.message || "Unable to run code",
      variant:"destructive",
       duration: 6000,
     });
   } finally {
     setIsLoading(false);
   }
 };


  return (
    <main className="flex flex-col p-6 w-screen  h-screen  ">
      
        <Link href={"/questions"}>
          <Button variant={"secondary"}> <ArrowBigLeftIcon/> </Button>
        </Link>
      
      <div className="p-6 h-full w-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full rounded-lg border text-white"
        >
          <ResizablePanel defaultSize={50}>
            <ProblemDescription problemId={params.id} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={60}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={90}>
                <div className=" h-full w-full">
                  <CodeEditor
                    language={language}
                    setLanguage={setLanguage}
                    code={code}
                    setCode={setCode}
                    problemId={params.id}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={60}>
                <div className="p-3 w-full flex flex-row-reverse items-center">
                  <Sheet>
                    <SheetTrigger>
                      <Button variant={"success"} className="mx-5">
                        {" "}
                        Upload{" "}
                      </Button>
                    </SheetTrigger>

                    <SheetContent className="bg-gray-800/80  ">
                      <SheetHeader>
                        <SheetTitle className="mb-10">
                          {" "}
                          <>
                            <h1 className="font-extrabold text-3xl text-white">
                              Applify
                            </h1>
                          </>
                        </SheetTitle>
                        <SheetDescription className="space-y-5">
                          <p className="text-white">
                            Upload your entire output in the textbox below{" "}
                          </p>
                          <Textarea
                            placeholder={`[1,0]\n[0,1]\n[]\n[2,10]`}
                            onChange={handleTextareaChange}
                            value={uploadOutputText}
                          />
                          <Button
                            variant={"secondary"}
                            onClick={() => console.log(uploadOutputText)}
                          >
                            {" "}
                            Submit{" "}
                          </Button>
                        </SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>

                  <Button className="mx-5" onClick={runCode}>
                    {" "}
                    Run{" "}
                  </Button>

                  <p className="flex-1">
                    {" "}
                    Passed {correct} /{problemInfo.testCases.length} cases{" "}
                  </p>
                </div>
                <section className="w-full p-4 space-y-5 h-[30vh] overflow-y-auto ">
                  {problemInfo.testCases.map((testCase, index) => {
                    let answer = null;

                    if (output !== null && isError === false) {
                      if (output[index] !== "") {
                        if (typeof output[index] === "string") {
                          answer = JSON.parse(output[index]);
                        } else {
                          answer = output[index];
                        }
                      }
                    }

                    return (
                      <TestcaseDetails
                        index={index}
                        key={index}
                        input={testCase.input}
                        output={testCase.output}
                        answer={answer}
                      />
                    );
                  })}
                </section>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
