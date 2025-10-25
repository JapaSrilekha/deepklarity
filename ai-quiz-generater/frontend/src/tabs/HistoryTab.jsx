import React, {useEffect, useState} from "react";
import { fetchHistory, fetchQuizById } from "../services/api";
import QuizDisplay from "../components/QuizDisplay";
import Modal from "../components/Modal";
export default function HistoryTab(){
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(()=>{
    (async()=>{
      try{
        const data = await fetchHistory();
        setItems(data);
      }catch(e){
        console.error(e);
      }
    })();
  },[]);
  async function openDetails(id){
    const d = await fetchQuizById(id);
    setSelected(d.quiz);
    setOpen(true);
  }
  return (
    <div>
      <table className="w-full border">
        <thead className="bg-gray-100"><tr><th className="p-2">ID</th><th>Title</th><th>URL</th><th>Action</th></tr></thead>
        <tbody>
          {items.map(it=>(
            <tr key={it.id} className="odd:bg-white even:bg-gray-50">
              <td className="p-2">{it.id}</td>
              <td>{it.title}</td>
              <td className="truncate max-w-xs">{it.url}</td>
              <td><button className="px-2 py-1 bg-blue-100 rounded" onClick={()=>openDetails(it.id)}>Details</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal open={open} onClose={()=>setOpen(false)}>
        {selected && <QuizDisplay quiz={selected} />}
      </Modal>
    </div>
  );
}
