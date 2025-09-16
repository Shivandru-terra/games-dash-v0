class GeneralFunctions {
  private static BASE_URL =
    "https://school-game-437522952831.asia-south1.run.app/api/v1";
  // private static BASE_URL = "http://localhost:8000/api/v1"
  private static GCP_URL =
    "https://aigames-dashboard-be-437522952831.asia-south1.run.app/files";
  // private static GCP_URL = "http://localhost:7700/files"
  public createUrl(url: string): string {
    return `${GeneralFunctions.BASE_URL}/${url}`;
  }

  public createGcpUrl(url: string): string {
    return `${GeneralFunctions.GCP_URL}${url}`;
  }
  

  public sanitizeGcpFileName(fileArr: string[]) {
    return fileArr?.map((file) => ({
      fullpath: file,
      shortName: file?.split("/").at(-1) || file,
    }));
  }

  public getUserEmail() {
    return localStorage.getItem("email") || "";
  }

  public getUserName() {
    return localStorage.getItem("name") || "";
  }

  public getUserId(){
    return localStorage.getItem("userId") || "";
  }
  
  public logout(){
    localStorage.clear();
  }
}

export const generalFunctions = new GeneralFunctions();
