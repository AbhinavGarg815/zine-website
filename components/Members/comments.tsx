import { Timestamp, arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import styles from "../../constants/styles";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import sendFCMMessage from "../../apis/sendFcm";
import { IMessageData, getMessages, getRoom } from "../../apis/room";
import { IProject } from "../../apis/projects";

const URL_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;

const Comments = ({ projectData }: { projectData: IProject }) => {
  const [project, setProject] = useState(projectData);
  const [comment, setComment] = useState("");
  const { authUser } = useAuth();
  useEffect(() => {
    console.log("project data11", project);
  }, [project]);

  const addComment = () => {
    if (!project) return;
    const commentData = {
      comment: comment.trim(),
      timeDate: Timestamp.fromDate(new Date()),
      user: authUser!.name,
    };
    setComment("");
    updateDoc(doc(db, "userTasks", project.id), {
      comments: arrayUnion(commentData),
    }).then(async () => {
      const newComments = [...project?.comments, commentData];
      setProject({ ...project, comments: newComments });
    });
  };

  return (
    <div className="">
      <div className="flex flex-col bg-white rounded-xl shadow-md my-4" style={{ minHeight: "50vh", overflowY: "hidden" }}>
        {/* Comments - only for admins */}
        {authUser!.type === "admin" && (
          <div className="flex flex-1 flex-col px-4 pt-2 pb-4">
            <p className="font-bold text-center text-lg" style={{ color: "#0C72B0" }}>
              COMMENTS
            </p>
            {project.comments?.map((ele) => {
              return (
                <div key={ele.timeDate.seconds} className="flex flex-1 flex-wrap flex-col md:flex-row my-2">
                  <div className="text-xs md:text-sm md:w-2/12 flex gap-4 md:gap-0 md:flex-col" style={{ color: "#8D989F" }}>
                    <p className="font-bold">{ele.timeDate.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
                    <p className="font-bold">{ele.timeDate.toDate().toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}</p>
                    <p className="">{ele.user.split(" ")[0]}</p>
                  </div>
                  <div className="text-sm md:text-normal break-words w-full md:w-10/12 md:ml-auto">
                    <p>{ele.comment}</p>
                  </div>
                </div>
              );
            })}
            <div className="flex mt-auto flex-col md:flex-row gap-4">
              <input
                className="rounded-xl w-11/12 p-2 focus:outline-none shadow-md"
                placeholder="Add comment here"
                style={{ background: "#EFEFEF", outline: "0.5px #808080 solid" }}
                onChange={(e) => setComment(e.target.value)}
                value={comment}
              />
              <button className="font-bold p-2 rounded-xl cursor-pointer hover:opacity-80 shadow-md" style={{ ...styles.textPrimary, background: "#C2FFF4" }} onClick={() => addComment()}>
                Add comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
