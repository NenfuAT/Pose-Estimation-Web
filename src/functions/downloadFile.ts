

export function downloadFile(file:Blob,filename:string){
	const url=window.URL.createObjectURL(file);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", `${filename}.csv`); // ダウンロード時にファイル名を指定する場合、ここにファイル名を設定できます
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}